
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
