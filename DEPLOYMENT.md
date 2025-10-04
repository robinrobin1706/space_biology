# Deployment Guide - NASA Space Biology Dashboard

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
aws cloudformation create-stack \
  --stack-name nasa-sb-stack \
  --template-body file://aws-template.yml
```

### Google Cloud Platform
```bash
# Using Google Cloud Run
gcloud run deploy nasa-space-biology \
  --image gcr.io/PROJECT_ID/nasa-space-biology \
  --platform managed \
  --region us-central1
```

### Azure Container Instances
```bash
# Create resource group
az group create --name nasa-rg --location eastus

# Deploy container
az container create \
  --resource-group nasa-rg \
  --name nasa-space-biology \
  --image nasa/space-biology-dashboard \
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
