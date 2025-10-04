# Create package.json with all required dependencies
package_json = """{
  "name": "nasa-space-biology-dashboard",
  "version": "2.0.0",
  "description": "NASA Space Biology Dashboard with MongoDB, AI/ML integration, and real-time data processing",
  "main": "enhanced_server.js",
  "scripts": {
    "start": "node enhanced_server.js",
    "dev": "nodemon enhanced_server.js",
    "seed": "node scripts/seed-database.js",
    "test": "jest",
    "lint": "eslint .",
    "build": "npm run build:client",
    "build:client": "webpack --mode production"
  },
  "keywords": [
    "nasa",
    "space-biology",
    "mongodb",
    "ai",
    "ml",
    "dashboard",
    "real-time",
    "websocket"
  ],
  "author": "NASA Space Biology Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "socket.io": "^4.7.4",
    "@tensorflow/tfjs-node": "^4.15.0",
    "natural": "^6.8.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "validator": "^13.11.0",
    "multer": "^1.4.5-lts.1",
    "csv-parser": "^3.0.0",
    "node-cron": "^3.0.3",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}"""

with open("package.json", "w") as f:
    f.write(package_json)

print("✅ Package.json created with all dependencies")

# Create .env template file
env_template = """# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nasa_space_biology?retryWrites=true&w=majority
# For local MongoDB, use: mongodb://localhost:27017/nasa_space_biology

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (Generate a strong secret key)
JWT_SECRET=your_super_secret_jwt_key_here

# External API Keys
NASA_API_KEY=your_nasa_api_key_here
OSDR_API_KEY=your_osdr_api_key_here

# AI/ML Configuration
TENSORFLOWJS_BACKEND=cpu
AI_MODEL_PATH=./models/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
"""

with open(".env.template", "w") as f:
    f.write(env_template)

print("✅ .env.template created for environment configuration")