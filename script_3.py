# Create database schemas and models file
models_js = """
// models/index.js - MongoDB Schemas and Models for NASA Space Biology Dashboard

const mongoose = require('mongoose');

// Experiment Schema with AI analysis integration
const ExperimentSchema = new mongoose.Schema({
    id: { 
        type: String, 
        unique: true, 
        required: true,
        index: true 
    },
    title: { 
        type: String, 
        required: true,
        maxlength: 200,
        index: 'text'
    },
    description: { 
        type: String, 
        required: true,
        maxlength: 2000,
        index: 'text'
    },
    impact: { 
        type: String, 
        required: true,
        maxlength: 1000 
    },
    organism: { 
        type: String, 
        required: true,
        index: true 
    },
    mission: { 
        type: String, 
        required: true,
        index: true 
    },
    duration: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ['Plant Biology', 'Cell Biology', 'Microbiology', 'Animal Biology'],
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['planned', 'active', 'completed', 'cancelled'],
        default: 'planned'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    
    // Dates
    dateCreated: { type: Date, default: Date.now, index: true },
    dateStarted: Date,
    dateCompleted: Date,
    lastUpdated: { type: Date, default: Date.now },
    
    // Relationships
    dataPoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataPoint' }],
    relatedPapers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }],
    
    // AI/ML Analysis Results
    aiAnalysis: {
        sentiment: { type: Number, min: -1, max: 1 },
        complexity: { type: Number, min: 0, max: 10 },
        keywords: [String],
        predictions: {
            successProbability: { type: Number, min: 0, max: 1 },
            riskFactors: [String],
            recommendations: [String],
            confidenceLevel: { type: Number, min: 0, max: 1 }
        },
        lastAnalyzed: { type: Date, default: Date.now }
    },
    
    // Metadata
    metadata: {
        dataQuality: { type: Number, min: 0, max: 1, default: 1 },
        dataVolume: { type: Number, default: 0 },
        tags: [String],
        contributors: [String]
    }
}, {
    timestamps: true
});

// Indexes for better performance
ExperimentSchema.index({ category: 1, status: 1 });
ExperimentSchema.index({ 'aiAnalysis.predictions.successProbability': -1 });
ExperimentSchema.index({ dateCreated: -1 });

// Data Point Schema for real-time experiment data
const DataPointSchema = new mongoose.Schema({
    experimentId: { 
        type: String, 
        required: true,
        index: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true 
    },
    
    // Measurement details
    measurementType: { 
        type: String, 
        required: true,
        enum: [
            'temperature', 'humidity', 'pressure', 'radiation',
            'cell_count', 'growth_rate', 'gene_expression',
            'protein_level', 'metabolite_concentration',
            'behavioral_metric', 'physiological_parameter'
        ]
    },
    value: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },
    unit: { 
        type: String,
        required: true 
    },
    
    // Data quality and processing
    quality: { 
        type: Number, 
        min: 0, 
        max: 1,
        default: 1 
    },
    processed: { 
        type: Boolean, 
        default: false,
        index: true 
    },
    processedAt: Date,
    
    // Source information
    source: { 
        type: String, 
        default: 'ISS',
        enum: ['ISS', 'Ground', 'Simulation', 'External API']
    },
    sensor: String,
    location: {
        facility: String,
        coordinates: {
            x: Number,
            y: Number,
            z: Number
        }
    },
    
    // Analysis results
    analysis: {
        outlier: { type: Boolean, default: false },
        trend: String,
        anomalies: [String],
        correlations: [String]
    },
    
    // Raw and processed data
    rawData: mongoose.Schema.Types.Mixed,
    processedData: mongoose.Schema.Types.Mixed,
    
    // Metadata
    metadata: {
        calibration: mongoose.Schema.Types.Mixed,
        conditions: mongoose.Schema.Types.Mixed,
        notes: String
    }
}, {
    timestamps: true
});

// Indexes for time-series data queries
DataPointSchema.index({ experimentId: 1, timestamp: -1 });
DataPointSchema.index({ measurementType: 1, timestamp: -1 });
DataPointSchema.index({ quality: -1, processed: 1 });

// Research Paper Schema
const PaperSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        maxlength: 300,
        index: 'text' 
    },
    summary: { 
        type: String, 
        required: true,
        maxlength: 2000,
        index: 'text' 
    },
    url: { 
        type: String, 
        required: true,
        unique: true 
    },
    doi: String,
    
    // Publication details
    publishDate: { type: Date, index: true },
    journal: String,
    authors: [{
        name: { type: String, required: true },
        affiliation: String,
        email: String
    }],
    
    // Classification
    relevance: { 
        type: Number, 
        min: 0, 
        max: 100,
        default: 50,
        index: true 
    },
    keywords: [{ type: String, index: true }],
    categories: [String],
    
    // Metrics
    citations: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    
    // AI Analysis
    aiAnalysis: {
        abstractSentiment: Number,
        topicModeling: [String],
        citationPrediction: Number,
        relatedExperiments: [String]
    },
    
    // Content
    abstract: String,
    fullText: String,
    figures: [String],
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'archived'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Analytics Schema for dashboard insights
const AnalyticsSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        default: Date.now,
        index: true 
    },
    
    // Basic metrics
    totalExperiments: { type: Number, default: 0 },
    activeExperiments: { type: Number, default: 0 },
    completedExperiments: { type: Number, default: 0 },
    dataPointsProcessed: { type: Number, default: 0 },
    
    // Category breakdown
    categoryDistribution: [{
        category: String,
        count: Number,
        percentage: Number
    }],
    
    // Mission breakdown
    missionDistribution: [{
        mission: String,
        count: Number,
        successRate: Number
    }],
    
    // AI Insights
    aiInsights: [{
        insight: String,
        confidence: Number,
        category: String,
        dateGenerated: { type: Date, default: Date.now }
    }],
    
    // Trends
    trendsIdentified: [{
        trend: String,
        direction: { type: String, enum: ['up', 'down', 'stable'] },
        significance: Number,
        timeframe: String
    }],
    
    // Predictions
    predictions: [{
        prediction: String,
        probability: Number,
        timeframe: String,
        category: String
    }],
    
    // Performance metrics
    performance: {
        apiResponseTime: Number,
        dataProcessingTime: Number,
        aiAnalysisTime: Number,
        databaseQueries: Number
    }
}, {
    timestamps: true
});

// User Schema for authentication and authorization
const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: 3,
        maxlength: 50 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8 
    },
    
    // Profile
    profile: {
        firstName: String,
        lastName: String,
        institution: String,
        department: String,
        position: String,
        bio: String,
        avatar: String
    },
    
    // Permissions
    role: { 
        type: String, 
        enum: ['viewer', 'researcher', 'admin', 'superuser'],
        default: 'viewer' 
    },
    permissions: [{
        resource: String,
        actions: [String]
    }],
    
    // Activity
    lastLogin: Date,
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,
    
    // Preferences
    preferences: {
        dashboard: {
            defaultView: { type: String, default: 'experiments' },
            refreshInterval: { type: Number, default: 30000 },
            notifications: { type: Boolean, default: true }
        },
        analysis: {
            defaultCategory: String,
            alertThreshold: Number,
            autoRefresh: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

// API Key Schema for external integrations
const ApiKeySchema = new mongoose.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    permissions: [String],
    rateLimit: {
        requests: { type: Number, default: 1000 },
        window: { type: Number, default: 3600000 } // 1 hour in ms
    },
    
    usage: {
        totalRequests: { type: Number, default: 0 },
        lastUsed: Date,
        requestsToday: { type: Number, default: 0 }
    },
    
    isActive: { type: Boolean, default: true },
    expiresAt: Date
}, {
    timestamps: true
});

// Create Models
const Experiment = mongoose.model('Experiment', ExperimentSchema);
const DataPoint = mongoose.model('DataPoint', DataPointSchema);
const Paper = mongoose.model('Paper', PaperSchema);
const Analytics = mongoose.model('Analytics', AnalyticsSchema);
const User = mongoose.model('User', UserSchema);
const ApiKey = mongoose.model('ApiKey', ApiKeySchema);

module.exports = {
    Experiment,
    DataPoint,
    Paper,
    Analytics,
    User,
    ApiKey
};
"""

# Create models directory and file
import os
if not os.path.exists('models'):
    os.makedirs('models')

with open("models/index.js", "w") as f:
    f.write(models_js)

print("✅ Database models created with comprehensive schemas")