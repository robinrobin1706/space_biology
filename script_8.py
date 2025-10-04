# Create deployment scripts and Docker configuration
docker_compose_yml = """version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: nasa-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: nasaadmin
      MONGO_INITDB_ROOT_PASSWORD: spacebiology2025
      MONGO_INITDB_DATABASE: nasa_space_biology
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./docker/mongo-init:/docker-entrypoint-initdb.d
    networks:
      - nasa-network

  # Node.js Backend Application
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nasa-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: mongodb://nasaadmin:spacebiology2025@mongodb:27017/nasa_space_biology?authSource=admin
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key}
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      - mongodb
    networks:
      - nasa-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for Caching (optional)
  redis:
    image: redis:7.2-alpine
    container_name: nasa-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - nasa-network
    command: redis-server --appendonly yes

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: nasa-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - api
    networks:
      - nasa-network

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  nasa-network:
    driver: bridge
"""

dockerfile = """# Multi-stage build for NASA Space Biology Dashboard
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nasa -u 1001

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ ./

# Create necessary directories
RUN mkdir -p logs uploads && \\
    chown -R 1001:1001 /app

# Switch to non-root user
USER 1001

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "enhanced_server.js"]
"""

# Create Docker directory structure
import os
os.makedirs('docker/nginx', exist_ok=True)
os.makedirs('docker/mongo-init', exist_ok=True)

with open("docker-compose.yml", "w") as f:
    f.write(docker_compose_yml)

with open("Dockerfile", "w") as f:
    f.write(dockerfile)

# Create nginx configuration
nginx_conf = """events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=search:10m rate=5r/s;

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy strict-origin-when-cross-origin;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Caching for static assets
            location ~* \\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                proxy_pass http://api;
            }
        }

        # Security
        location ~ /\\. {
            deny all;
        }
    }
}
"""

with open("docker/nginx/nginx.conf", "w") as f:
    f.write(nginx_conf)

# MongoDB initialization script
mongo_init_script = """// MongoDB initialization script for NASA Space Biology Dashboard

// Create database
db = db.getSiblingDB('nasa_space_biology');

// Create collections with validation
db.createCollection('experiments', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['id', 'title', 'description', 'category'],
            properties: {
                id: { bsonType: 'string' },
                title: { bsonType: 'string' },
                description: { bsonType: 'string' },
                category: { 
                    bsonType: 'string',
                    enum: ['Plant Biology', 'Cell Biology', 'Microbiology', 'Animal Biology']
                }
            }
        }
    }
});

db.createCollection('datapoints', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['experimentId', 'measurementType', 'value'],
            properties: {
                experimentId: { bsonType: 'string' },
                measurementType: { bsonType: 'string' },
                value: { bsonType: ['number', 'string'] }
            }
        }
    }
});

db.createCollection('papers');
db.createCollection('analytics');
db.createCollection('users');

// Create indexes
db.experiments.createIndex({ 'id': 1 }, { unique: true });
db.experiments.createIndex({ 'category': 1 });
db.experiments.createIndex({ 'status': 1 });
db.experiments.createIndex({ 'title': 'text', 'description': 'text' });

db.datapoints.createIndex({ 'experimentId': 1, 'timestamp': -1 });
db.datapoints.createIndex({ 'measurementType': 1 });
db.datapoints.createIndex({ 'timestamp': -1 });

db.papers.createIndex({ 'title': 'text', 'summary': 'text' });
db.papers.createIndex({ 'relevance': -1 });

db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'username': 1 }, { unique: true });

print('NASA Space Biology Database initialized successfully!');
"""

with open("docker/mongo-init/init-nasa-db.js", "w") as f:
    f.write(mongo_init_script)

print("✅ Docker configuration created")

# Create deployment guide
deployment_guide = """# Deployment Guide - NASA Space Biology Dashboard

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- 4GB+ RAM available
- 10GB+ disk space

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd nasa-space-biology-dashboard

# Create environment file
cp .env.template .env
# Edit .env with your configuration

# Build and start services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api

# Seed database
docker-compose exec api npm run seed
```

### Services
- **API**: http://localhost:3000 (Main application)
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Nginx**: localhost:80 (Reverse proxy)

## 🔧 Manual Deployment

### 1. System Requirements
- Node.js 18+
- MongoDB 6.0+
- RAM: 2GB minimum, 4GB recommended
- Storage: 5GB minimum

### 2. MongoDB Setup
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install -y mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 3. Application Setup
```bash
# Install dependencies
npm install

# Environment setup
cp .env.template .env
# Configure MongoDB URI, JWT secret, etc.

# Database initialization
npm run seed

# Start application
npm start
```

## 🌐 Production Deployment

### AWS Deployment
```bash
# Using AWS ECS with Docker
aws ecs create-cluster --cluster-name nasa-space-biology

# Deploy using CloudFormation template
aws cloudformation create-stack \\
  --stack-name nasa-sb-stack \\
  --template-body file://aws-template.yml
```

### Google Cloud Platform
```bash
# Using Google Cloud Run
gcloud run deploy nasa-space-biology \\
  --image gcr.io/PROJECT_ID/nasa-space-biology \\
  --platform managed \\
  --region us-central1
```

### Azure Container Instances
```bash
# Create resource group
az group create --name nasa-rg --location eastus

# Deploy container
az container create \\
  --resource-group nasa-rg \\
  --name nasa-space-biology \\
  --image nasa/space-biology-dashboard \\
  --ports 3000
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificates (Let's Encrypt)
certbot --nginx -d yourdomain.com

# Update nginx configuration
# Add SSL certificate paths to nginx.conf
```

### Environment Variables (Production)
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nasa_space_biology
JWT_SECRET=your-256-bit-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start enhanced_server.js --name nasa-api
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Log Management
```bash
# View application logs
tail -f logs/app.log

# Docker logs
docker-compose logs -f api

# Nginx access logs
tail -f logs/nginx/access.log
```

## 🔧 Performance Optimization

### Database Optimization
```javascript
// MongoDB indexes
db.experiments.createIndex({ "category": 1, "status": 1 });
db.datapoints.createIndex({ "experimentId": 1, "timestamp": -1 });

// Connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Caching Strategy
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD
});

// Cache API responses
app.get('/api/experiments', cache('5 minutes'), experimentController);
```

## 🧪 Testing Deployment

### Health Checks
```bash
# API health check
curl http://localhost:3000/api/health

# Database connectivity
curl http://localhost:3000/api/experiments

# WebSocket connection
npm run test:websocket
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check network connectivity
   telnet localhost 27017
   
   # Verify credentials
   mongo mongodb://username:password@localhost:27017/nasa_space_biology
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   
   # Monitor Node.js memory
   node --max-old-space-size=4096 enhanced_server.js
   ```

4. **Docker Issues**
   ```bash
   # Clean up Docker
   docker system prune -a
   
   # Rebuild containers
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Logs and Debugging
```bash
# Enable debug mode
NODE_ENV=development DEBUG=* npm start

# Check application logs
tail -f logs/app.log | grep ERROR

# Database logs
tail -f /var/log/mongodb/mongod.log
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
services:
  api:
    scale: 3
    depends_on:
      - mongodb
      - redis
  
  nginx:
    depends_on:
      - api
```

### Database Scaling
```javascript
// MongoDB replica set
rs.initiate({
  _id: "nasa-rs",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" }
  ]
});
```

## 🔄 Updates and Maintenance

### Rolling Updates
```bash
# Build new image
docker build -t nasa/space-biology:v2.0 .

# Update docker-compose.yml
# Change image version

# Rolling update
docker-compose up -d --no-deps api
```

### Database Migrations
```bash
# Run migration scripts
npm run migrate

# Backup before updates
mongodump --db nasa_space_biology --out backup/
```

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment configuration
3. Test individual components
4. Check network connectivity
5. Review security settings

Contact: nasa-space-biology-support@nasa.gov
"""

with open("DEPLOYMENT.md", "w") as f:
    f.write(deployment_guide)

print("✅ Deployment guide and Docker configuration created")
print("\n🎯 SUMMARY OF ENHANCED BACKEND SYSTEM:")
print("=" * 50)
print("✅ Enhanced server.js with MongoDB & AI/ML")
print("✅ Comprehensive database models and schemas")
print("✅ AI/ML services for data analysis")
print("✅ Database seeding script with sample data")
print("✅ Updated frontend with backend integration")
print("✅ Enhanced styles for new features")
print("✅ Docker deployment configuration")
print("✅ Complete documentation and guides")