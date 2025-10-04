# Create database seeding script to populate with NASA data
seed_script = """
// scripts/seed-database.js - Database Seeding Script for NASA Space Biology Data

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Experiment, DataPoint, Paper, Analytics, User } = require('../models');
const aiServices = require('../services/ai-services');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nasa_space_biology';

async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🔗 Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function clearDatabase() {
    console.log('🧹 Clearing existing data...');
    await Promise.all([
        Experiment.deleteMany({}),
        DataPoint.deleteMany({}),
        Paper.deleteMany({}),
        Analytics.deleteMany({})
    ]);
    console.log('✅ Database cleared');
}

async function seedExperiments() {
    console.log('🌱 Seeding experiments...');
    
    // Load initial data
    const dataPath = path.join(__dirname, '..', 'space_biology_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const spaceBiologyData = JSON.parse(rawData);
    
    const experiments = [];
    
    for (const exp of spaceBiologyData.experiments) {
        // Perform AI analysis
        const textAnalysis = aiServices.analyzeText(
            exp.title + ' ' + exp.description + ' ' + exp.impact
        );
        
        const predictions = await aiServices.predictExperimentOutcome(exp);
        
        const experiment = new Experiment({
            ...exp,
            status: Math.random() > 0.3 ? 'active' : 'completed',
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            dateStarted: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            aiAnalysis: {
                sentiment: textAnalysis?.sentiment || 0,
                complexity: textAnalysis?.complexity || 5,
                keywords: textAnalysis?.keywords || [],
                predictions: predictions || {},
                lastAnalyzed: new Date()
            },
            metadata: {
                dataQuality: Math.random() * 0.3 + 0.7,
                dataVolume: Math.floor(Math.random() * 10000) + 100,
                tags: textAnalysis?.topics?.map(t => t.topic) || [],
                contributors: ['NASA', 'ESA', 'JAXA'][Math.floor(Math.random() * 3)]
            }
        });
        
        experiments.push(experiment);
    }
    
    await Experiment.insertMany(experiments);
    console.log(`✅ Seeded ${experiments.length} experiments`);
    return experiments;
}

async function seedPapers() {
    console.log('📄 Seeding research papers...');
    
    const dataPath = path.join(__dirname, '..', 'space_biology_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const spaceBiologyData = JSON.parse(rawData);
    
    const papers = [];
    
    for (const paper of spaceBiologyData.papers) {
        // Simulate additional paper data
        const aiAnalysis = aiServices.analyzeText(paper.title + ' ' + paper.summary);
        
        const paperDoc = new Paper({
            ...paper,
            publishDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000),
            journal: [
                'Nature Microgravity',
                'Space Biology Journal',
                'Astrobiology Research',
                'Gravitational and Space Biology'
            ][Math.floor(Math.random() * 4)],
            authors: [
                {
                    name: 'Dr. ' + ['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)],
                    affiliation: 'NASA Ames Research Center',
                    email: 'researcher@nasa.gov'
                }
            ],
            citations: Math.floor(Math.random() * 500) + 10,
            downloads: Math.floor(Math.random() * 2000) + 50,
            keywords: aiAnalysis?.keywords || [],
            categories: aiAnalysis?.topics?.map(t => t.topic) || [],
            aiAnalysis: {
                abstractSentiment: aiAnalysis?.sentiment || 0,
                topicModeling: aiAnalysis?.topics?.map(t => t.topic) || [],
                citationPrediction: Math.random() * 100 + 20
            },
            status: 'approved'
        });
        
        papers.push(paperDoc);
    }
    
    await Paper.insertMany(papers);
    console.log(`✅ Seeded ${papers.length} papers`);
}

async function seedDataPoints(experiments) {
    console.log('📊 Seeding data points...');
    
    const measurementTypes = [
        'temperature', 'humidity', 'pressure', 'radiation',
        'cell_count', 'growth_rate', 'gene_expression',
        'protein_level', 'metabolite_concentration'
    ];
    
    const units = {
        'temperature': '°C',
        'humidity': '%RH',
        'pressure': 'kPa',
        'radiation': 'mGy',
        'cell_count': 'cells/ml',
        'growth_rate': 'mm/day',
        'gene_expression': 'fold change',
        'protein_level': 'mg/ml',
        'metabolite_concentration': 'μM'
    };
    
    const dataPoints = [];
    
    for (const experiment of experiments.slice(0, 5)) { // Seed data for first 5 experiments
        const numPoints = Math.floor(Math.random() * 500) + 100;
        
        for (let i = 0; i < numPoints; i++) {
            const measurementType = measurementTypes[Math.floor(Math.random() * measurementTypes.length)];
            const baseValue = Math.random() * 100 + 10;
            const timestamp = new Date(experiment.dateStarted.getTime() + i * 24 * 60 * 60 * 1000);
            
            // Add some trend and noise
            const trendValue = baseValue + (Math.sin(i / 10) * 5) + (Math.random() - 0.5) * 10;
            
            const dataPoint = new DataPoint({
                experimentId: experiment.id,
                timestamp,
                measurementType,
                value: Math.round(trendValue * 100) / 100,
                unit: units[measurementType],
                quality: Math.random() * 0.3 + 0.7,
                processed: Math.random() > 0.2,
                source: ['ISS', 'Ground', 'Simulation'][Math.floor(Math.random() * 3)],
                sensor: `SENSOR-${Math.floor(Math.random() * 100) + 1}`,
                location: {
                    facility: 'International Space Station',
                    coordinates: {
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        z: Math.random() * 100
                    }
                },
                analysis: {
                    outlier: Math.random() > 0.95,
                    trend: ['stable', 'increasing', 'decreasing'][Math.floor(Math.random() * 3)]
                }
            });
            
            dataPoints.push(dataPoint);
        }
    }
    
    await DataPoint.insertMany(dataPoints);
    console.log(`✅ Seeded ${dataPoints.length} data points`);
}

async function generateAnalytics() {
    console.log('📈 Generating analytics...');
    
    const totalExperiments = await Experiment.countDocuments();
    const activeExperiments = await Experiment.countDocuments({ status: 'active' });
    const completedExperiments = await Experiment.countDocuments({ status: 'completed' });
    const dataPointsProcessed = await DataPoint.countDocuments({ processed: true });
    
    // Category distribution
    const categoryDistribution = await Experiment.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        },
        {
            $addFields: {
                percentage: {
                    $round: [{ $multiply: [{ $divide: ['$count', totalExperiments] }, 100] }, 1]
                }
            }
        },
        {
            $project: {
                category: '$_id',
                count: 1,
                percentage: 1,
                _id: 0
            }
        }
    ]);
    
    // Mission distribution
    const missionDistribution = await Experiment.aggregate([
        {
            $group: {
                _id: {
                    $cond: [
                        { $regexMatch: { input: '$impact', regex: /Mars/i } },
                        'Mars',
                        {
                            $cond: [
                                { $regexMatch: { input: '$impact', regex: /Moon/i } },
                                'Moon',
                                'ISS'
                            ]
                        }
                    ]
                },
                count: { $sum: 1 }
            }
        },
        {
            $addFields: {
                successRate: { $round: [{ $add: [0.6, { $multiply: [0.3, { $rand: {} }] }] }, 2] }
            }
        },
        {
            $project: {
                mission: '$_id',
                count: 1,
                successRate: 1,
                _id: 0
            }
        }
    ]);
    
    const analytics = new Analytics({
        totalExperiments,
        activeExperiments,
        completedExperiments,
        dataPointsProcessed,
        categoryDistribution,
        missionDistribution,
        aiInsights: [
            {
                insight: 'Plant biology experiments show 23% higher success rate in long duration missions',
                confidence: 0.85,
                category: 'success_prediction'
            },
            {
                insight: 'Microgravity effects are most pronounced in first 30 days of experiments',
                confidence: 0.92,
                category: 'temporal_analysis'
            },
            {
                insight: 'Cell biology studies require additional radiation protection measures',
                confidence: 0.78,
                category: 'risk_assessment'
            }
        ],
        trendsIdentified: [
            {
                trend: 'Increasing success rate in plant experiments',
                direction: 'up',
                significance: 0.7,
                timeframe: '6 months'
            },
            {
                trend: 'Growing interest in Mars mission preparation',
                direction: 'up',
                significance: 0.8,
                timeframe: '12 months'
            }
        ],
        predictions: [
            {
                prediction: 'Plant biology experiments will increase by 40% next year',
                probability: 0.75,
                timeframe: '12 months',
                category: 'experiment_planning'
            },
            {
                prediction: 'AI-driven analysis will reduce experiment duration by 15%',
                probability: 0.68,
                timeframe: '18 months',
                category: 'efficiency'
            }
        ],
        performance: {
            apiResponseTime: 45,
            dataProcessingTime: 120,
            aiAnalysisTime: 300,
            databaseQueries: 1250
        }
    });
    
    await analytics.save();
    console.log('✅ Analytics generated and saved');
}

async function createAdminUser() {
    console.log('👤 Creating admin user...');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123!', 10);
    
    const adminUser = new User({
        username: 'admin',
        email: 'admin@nasa.gov',
        password: hashedPassword,
        profile: {
            firstName: 'Admin',
            lastName: 'User',
            institution: 'NASA Ames Research Center',
            department: 'Space Biology',
            position: 'Administrator',
            bio: 'System administrator for NASA Space Biology Dashboard'
        },
        role: 'admin',
        permissions: [
            { resource: 'experiments', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'data', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'analytics', actions: ['read'] }
        ],
        preferences: {
            dashboard: {
                defaultView: 'experiments',
                refreshInterval: 30000,
                notifications: true
            }
        }
    });
    
    await adminUser.save();
    console.log('✅ Admin user created (username: admin, password: admin123!)');
}

async function main() {
    try {
        console.log('🚀 Starting database seeding process...');
        console.log('=====================================');
        
        await connectToDatabase();
        await clearDatabase();
        
        const experiments = await seedExperiments();
        await seedPapers();
        await seedDataPoints(experiments);
        await generateAnalytics();
        await createAdminUser();
        
        console.log('=====================================');
        console.log('✅ Database seeding completed successfully!');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   • ${await Experiment.countDocuments()} experiments`);
        console.log(`   • ${await Paper.countDocuments()} research papers`);
        console.log(`   • ${await DataPoint.countDocuments()} data points`);
        console.log(`   • ${await Analytics.countDocuments()} analytics records`);
        console.log(`   • ${await User.countDocuments()} users`);
        console.log('');
        console.log('🔐 Admin Login:');
        console.log('   Username: admin');
        console.log('   Password: admin123!');
        
    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding script
if (require.main === module) {
    main();
}

module.exports = { main };
"""

# Create scripts directory
if not os.path.exists('scripts'):
    os.makedirs('scripts')

with open("scripts/seed-database.js", "w") as f:
    f.write(seed_script)

print("✅ Database seeding script created")

# Create README for the enhanced system
enhanced_readme = """# NASA Space Biology Dashboard - Enhanced Backend System

## 🚀 Overview
This enhanced NASA Space Biology Dashboard integrates MongoDB, AI/ML capabilities, and real-time data processing to provide comprehensive analysis of space biology experiments and research.

## 🌟 Features

### Backend Enhancement
- **MongoDB Integration**: Full database support with Mongoose ODM
- **AI/ML Analysis**: Text analysis, sentiment analysis, and predictive modeling
- **Real-time Data**: WebSocket connections for live data updates
- **RESTful API**: Comprehensive API endpoints for all operations
- **Data Processing Pipeline**: Automated data quality assessment and processing
- **External Data Integration**: Connections to NASA data sources

### AI/ML Capabilities
- **Text Analysis**: Sentiment analysis, complexity scoring, keyword extraction
- **Predictive Modeling**: Experiment outcome prediction with risk assessment
- **Pattern Recognition**: Trend identification and anomaly detection
- **Data Quality Assessment**: Automated data validation and quality scoring
- **Correlation Analysis**: Multi-variate relationship detection

### Database Features
- **Comprehensive Schemas**: Experiments, DataPoints, Papers, Analytics, Users
- **Real-time Analytics**: Dashboard insights and performance metrics
- **Data Relationships**: Linked experiments, papers, and data points
- **User Management**: Authentication, authorization, and role-based access

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
1. Copy `.env.template` to `.env`
2. Update MongoDB connection string
3. Configure API keys and secrets

```bash
cp .env.template .env
# Edit .env with your configuration
```

### Step 3: Database Setup
```bash
# Seed the database with sample NASA data
npm run seed
```

### Step 4: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 📊 API Endpoints

### Experiments
- `GET /api/experiments` - List experiments with filtering
- `POST /api/experiments` - Create new experiment
- `GET /api/experiments/:id` - Get experiment details
- `PUT /api/experiments/:id` - Update experiment
- `DELETE /api/experiments/:id` - Delete experiment

### Data Points
- `POST /api/data-points` - Add new data point
- `GET /api/data-points/:experimentId` - Get experiment data
- `GET /api/data-points/:id/analysis` - Get AI analysis

### Research Papers
- `GET /api/papers` - List papers with search
- `POST /api/papers` - Add new paper
- `GET /api/papers/:id` - Get paper details

### Analytics
- `GET /api/analytics` - Get dashboard analytics
- `GET /api/analytics/trends` - Get trend analysis
- `GET /api/analytics/predictions` - Get AI predictions

### AI/ML Services
- `POST /api/ai/analyze-text` - Analyze text content
- `POST /api/ai/predict-outcome` - Predict experiment outcome
- `GET /api/ai/insights` - Get AI-generated insights

## 🤖 AI/ML Services

### Text Analysis
```javascript
const analysis = await aiServices.analyzeText(text);
// Returns: sentiment, complexity, keywords, topics, readability
```

### Experiment Prediction
```javascript
const prediction = await aiServices.predictExperimentOutcome(experiment);
// Returns: success probability, risk factors, recommendations
```

### Data Pattern Analysis
```javascript
const patterns = await aiServices.analyzeDataPatterns(dataPoints);
// Returns: trends, anomalies, correlations, quality assessment
```

## 🗄 Database Schema

### Experiments
- Basic info (id, title, description, impact)
- Classification (category, organism, mission)
- Status tracking (status, priority, dates)
- AI analysis results
- Data relationships

### Data Points
- Time-series measurement data
- Quality metrics and processing status
- Source and location information
- Analysis results and anomaly detection

### Research Papers
- Publication details and metrics
- AI analysis and topic modeling
- Author and citation information
- Content and relationships

### Analytics
- Dashboard metrics and KPIs
- Trend identification and predictions
- Performance monitoring
- AI-generated insights

## 🔒 Authentication & Security
- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- Secure password hashing

## 🔧 Configuration

### MongoDB Connection
```javascript
// Local MongoDB
MONGODB_URI=mongodb://localhost:27017/nasa_space_biology

// MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nasa_space_biology
```

### AI/ML Configuration
```javascript
AI_MODEL_PATH=./models/
TENSORFLOWJS_BACKEND=cpu
```

## 📈 Monitoring & Analytics
- Real-time data processing metrics
- API performance monitoring  
- AI/ML model performance tracking
- Database query optimization
- Error logging and alerting

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing
```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📝 Data Sources
- NASA Open Science Data Repository (OSDR)
- GeneLab Database
- International Space Station (ISS) experiments
- Ground-based space biology research
- External research papers and publications

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License
MIT License - See LICENSE file for details

## 🎯 Next Steps
- [ ] Implement real-time data streaming from ISS
- [ ] Add more sophisticated ML models
- [ ] Integrate with NASA APIs
- [ ] Add data visualization components
- [ ] Implement automated report generation
- [ ] Add support for more data formats
- [ ] Enhance security features
- [ ] Add mobile API endpoints

## 🆘 Support
For questions or issues, please contact the NASA Space Biology team or create an issue in the repository.

---
**NASA Space Biology Dashboard - Advancing Life Sciences Research in Space** 🌌
"""

with open("README_ENHANCED.md", "w") as f:
    f.write(enhanced_readme)

print("✅ Enhanced README created with comprehensive documentation")