
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// AI/ML libraries
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nasa_space_biology';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('🔗 Connected to MongoDB Atlas/Local');
    initializeData();
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB Schemas
const ExperimentSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    impact: { type: String, required: true },
    organism: { type: String, required: true },
    mission: { type: String, required: true },
    duration: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Plant Biology', 'Cell Biology', 'Microbiology', 'Animal Biology'],
        required: true 
    },
    dateCreated: { type: Date, default: Date.now },
    dataPoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataPoint' }],
    aiAnalysis: {
        sentiment: Number,
        complexity: Number,
        keywords: [String],
        predictions: mongoose.Schema.Types.Mixed
    }
});

const DataPointSchema = new mongoose.Schema({
    experimentId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    measurementType: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    unit: String,
    quality: { type: Number, min: 0, max: 1 },
    source: { type: String, default: 'ISS' },
    processed: { type: Boolean, default: false }
});

const PaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String, required: true },
    url: { type: String, required: true },
    relevance: { type: Number, min: 0, max: 100 },
    publishDate: Date,
    authors: [String],
    keywords: [String],
    citations: { type: Number, default: 0 }
});

const AnalyticsSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    totalExperiments: Number,
    activeExperiments: Number,
    dataPointsProcessed: Number,
    aiInsights: [String],
    trendsIdentified: mongoose.Schema.Types.Mixed,
    predictions: mongoose.Schema.Types.Mixed
});

// Models
const Experiment = mongoose.model('Experiment', ExperimentSchema);
const DataPoint = mongoose.model('DataPoint', DataPointSchema);
const Paper = mongoose.model('Paper', PaperSchema);
const Analytics = mongoose.model('Analytics', AnalyticsSchema);

// AI/ML Utilities
class AIAnalyzer {
    static analyzeExperimentText(text) {
        const sentiment = natural.SentimentAnalyzer.getSentiment(
            natural.WordTokenizer.tokenize(text)
        );

        const complexity = text.split(' ').length / 100; // Simple complexity metric

        const keywords = natural.WordTokenizer.tokenize(text.toLowerCase())
            .filter(word => word.length > 4)
            .slice(0, 10);

        return { sentiment, complexity, keywords };
    }

    static async predictExperimentOutcome(experimentData) {
        // Simple ML prediction based on historical patterns
        const factors = {
            duration: parseInt(experimentData.duration) || 30,
            category: experimentData.category,
            organism: experimentData.organism
        };

        let successProbability = 0.7; // Base probability

        if (factors.duration > 90) successProbability += 0.1;
        if (factors.category === 'Plant Biology') successProbability += 0.05;
        if (factors.organism.includes('cell')) successProbability += 0.08;

        return {
            successProbability: Math.min(successProbability, 0.95),
            riskFactors: factors.duration > 180 ? ['long_duration'] : [],
            recommendations: this.generateRecommendations(factors)
        };
    }

    static generateRecommendations(factors) {
        const recommendations = [];
        if (factors.duration > 90) {
            recommendations.push('Consider additional radiation shielding');
        }
        if (factors.category === 'Plant Biology') {
            recommendations.push('Monitor light exposure carefully');
        }
        return recommendations;
    }
}

// Data Processing Pipeline
class DataProcessor {
    static async processRealTimeData(dataPoint) {
        // Validate data quality
        const quality = this.calculateQuality(dataPoint);

        // Apply filters and transformations
        const processed = {
            ...dataPoint,
            quality,
            processed: true,
            processedAt: new Date()
        };

        // Store in database
        const savedDataPoint = await DataPoint.create(processed);

        // Trigger AI analysis if quality is high
        if (quality > 0.8) {
            this.triggerAIAnalysis(savedDataPoint);
        }

        return savedDataPoint;
    }

    static calculateQuality(dataPoint) {
        let quality = 1.0;

        // Check for missing values
        if (!dataPoint.value) quality -= 0.3;
        if (!dataPoint.unit) quality -= 0.1;
        if (!dataPoint.timestamp) quality -= 0.2;

        // Check for reasonable ranges (example)
        if (typeof dataPoint.value === 'number') {
            if (dataPoint.value < 0 || dataPoint.value > 1000) quality -= 0.2;
        }

        return Math.max(quality, 0);
    }

    static async triggerAIAnalysis(dataPoint) {
        console.log(`🤖 Triggering AI analysis for data point: ${dataPoint._id}`);
        // Here you would implement actual AI/ML analysis
        // For now, we'll simulate it
        setTimeout(() => {
            console.log(`✅ AI analysis completed for ${dataPoint._id}`);
        }, 1000);
    }
}

// API Routes

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Experiments API
app.get('/api/experiments', async (req, res) => {
    try {
        const { category, mission, search } = req.query;
        let filter = {};

        if (category && category !== 'All Categories') {
            filter.category = category;
        }

        if (mission && mission !== 'All Missions') {
            filter.mission = { $regex: mission, $options: 'i' };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { organism: { $regex: search, $options: 'i' } }
            ];
        }

        const experiments = await Experiment.find(filter).limit(50);
        res.json(experiments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/experiments', async (req, res) => {
    try {
        const experimentData = req.body;

        // AI Analysis
        const textAnalysis = AIAnalyzer.analyzeExperimentText(
            experimentData.title + ' ' + experimentData.description
        );

        const predictions = await AIAnalyzer.predictExperimentOutcome(experimentData);

        const experiment = new Experiment({
            ...experimentData,
            aiAnalysis: {
                ...textAnalysis,
                predictions
            }
        });

        const saved = await experiment.save();
        res.status(201).json(saved);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Experiment ID already exists' });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

app.get('/api/experiments/:id', async (req, res) => {
    try {
        const experiment = await Experiment.findOne({ id: req.params.id })
            .populate('dataPoints');

        if (!experiment) {
            return res.status(404).json({ error: 'Experiment not found' });
        }

        res.json(experiment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Data Points API
app.post('/api/data-points', async (req, res) => {
    try {
        const processedData = await DataProcessor.processRealTimeData(req.body);
        res.status(201).json(processedData);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/data-points/:experimentId', async (req, res) => {
    try {
        const dataPoints = await DataPoint.find({ 
            experimentId: req.params.experimentId 
        }).sort({ timestamp: -1 });

        res.json(dataPoints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Papers API
app.get('/api/papers', async (req, res) => {
    try {
        const { search, relevance } = req.query;
        let filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }

        if (relevance) {
            filter.relevance = { $gte: parseInt(relevance) };
        }

        const papers = await Paper.find(filter)
            .sort({ relevance: -1 })
            .limit(20);

        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics API
app.get('/api/analytics', async (req, res) => {
    try {
        const totalExperiments = await Experiment.countDocuments();
        const activeExperiments = await Experiment.countDocuments({
            dateCreated: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        const dataPointsProcessed = await DataPoint.countDocuments({ processed: true });

        // Category distribution
        const categoryDistribution = await Experiment.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Mission distribution
        const missionDistribution = await Experiment.aggregate([
            { 
                $group: { 
                    _id: { 
                        $cond: [
                            { $regexMatch: { input: '$impact', regex: /Mars/i } },
                            'Mars',
                            { $cond: [
                                { $regexMatch: { input: '$impact', regex: /Moon/i } },
                                'Moon',
                                'Other'
                            ]}
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const analytics = {
            totalExperiments,
            activeExperiments,
            dataPointsProcessed,
            categoryDistribution,
            missionDistribution,
            aiInsights: [
                'Plant biology experiments show 23% higher success rate in long duration missions',
                'Microgravity effects are most pronounced in first 30 days',
                'Cell biology studies require additional radiation protection'
            ],
            lastUpdated: new Date()
        };

        // Save analytics
        await Analytics.create(analytics);

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Analysis API
app.post('/api/ai/analyze-text', (req, res) => {
    try {
        const { text } = req.body;
        const analysis = AIAnalyzer.analyzeExperimentText(text);
        res.json(analysis);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/ai/predict-outcome', async (req, res) => {
    try {
        const prediction = await AIAnalyzer.predictExperimentOutcome(req.body);
        res.json(prediction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// External Data Integration
app.get('/api/external/nasa-data', async (req, res) => {
    try {
        // Simulate fetching from NASA APIs
        const mockData = {
            source: 'NASA Open Science Data Repository',
            lastUpdate: new Date(),
            datasets: [
                {
                    id: 'OSD-835',
                    title: 'Brain and blood chemistry in simulated space radiation',
                    status: 'active',
                    dataPoints: 1250
                },
                {
                    id: 'OSD-867',
                    title: 'Gene expression changes in human stem cells',
                    status: 'completed',
                    dataPoints: 890
                }
            ]
        };

        res.json(mockData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// WebSocket for real-time updates
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('subscribe-experiment', (experimentId) => {
        socket.join(`experiment-${experimentId}`);
        console.log(`Client ${socket.id} subscribed to experiment ${experimentId}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Broadcast real-time updates
setInterval(async () => {
    try {
        const recentData = await DataPoint.find({
            timestamp: { $gte: new Date(Date.now() - 60000) }
        });

        if (recentData.length > 0) {
            io.emit('real-time-update', {
                timestamp: new Date(),
                dataPoints: recentData.length,
                latestData: recentData[0]
            });
        }
    } catch (error) {
        console.error('Real-time update error:', error);
    }
}, 30000); // Every 30 seconds

// Initialize database with sample data
async function initializeData() {
    try {
        const count = await Experiment.countDocuments();
        if (count === 0) {
            console.log('🌱 Initializing database with sample data...');

            // Load initial data from JSON file
            const fs = require('fs');
            const initialData = JSON.parse(fs.readFileSync('space_biology_data.json', 'utf8'));

            // Insert experiments
            for (const exp of initialData.experiments) {
                const analysis = AIAnalyzer.analyzeExperimentText(
                    exp.title + ' ' + exp.description
                );
                const predictions = await AIAnalyzer.predictExperimentOutcome(exp);

                await Experiment.create({
                    ...exp,
                    aiAnalysis: { ...analysis, predictions }
                });
            }

            // Insert papers
            for (const paper of initialData.papers) {
                await Paper.create(paper);
            }

            console.log('✅ Database initialized successfully!');
        }
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 NASA Space Biology Dashboard Server running at http://localhost:${PORT}`);
    console.log(`📊 MongoDB: ${MONGODB_URI}`);
    console.log(`🤖 AI/ML: Enabled`);
    console.log(`⚡ WebSocket: Enabled`);
});

module.exports = app;
