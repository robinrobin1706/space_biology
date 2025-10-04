# Create AI/ML services for data analysis
ai_services_js = """
// services/ai-services.js - AI/ML Services for Space Biology Data Analysis

const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const { Experiment, DataPoint } = require('../models');

class SpaceBiologyAI {
    constructor() {
        this.models = {};
        this.isInitialized = false;
        this.initializeModels();
    }

    async initializeModels() {
        try {
            console.log('🤖 Initializing AI/ML models...');
            
            // Initialize sentiment analyzer
            this.sentimentAnalyzer = new natural.SentimentAnalyzer(
                'English',
                natural.PorterStemmer,
                'afinn'
            );
            
            // Initialize tokenizer
            this.tokenizer = new natural.WordTokenizer();
            
            // Initialize TF-IDF for document similarity
            this.tfidf = new natural.TfIdf();
            
            this.isInitialized = true;
            console.log('✅ AI/ML models initialized successfully');
        } catch (error) {
            console.error('❌ AI/ML initialization error:', error);
        }
    }

    // Text Analysis for Experiments and Papers
    analyzeText(text) {
        if (!text || !this.isInitialized) return null;

        try {
            const tokens = this.tokenizer.tokenize(text.toLowerCase());
            const stems = tokens.map(token => natural.PorterStemmer.stem(token));
            
            // Sentiment analysis
            const sentiment = this.sentimentAnalyzer.getSentiment(stems);
            
            // Complexity analysis
            const complexity = this.calculateComplexity(text);
            
            // Extract keywords
            const keywords = this.extractKeywords(text);
            
            // Topic classification
            const topics = this.classifyTopics(text);
            
            return {
                sentiment: Math.round(sentiment * 100) / 100,
                complexity,
                keywords,
                topics,
                readabilityScore: this.calculateReadabilityScore(text),
                technicalTerms: this.identifyTechnicalTerms(text)
            };
        } catch (error) {
            console.error('Text analysis error:', error);
            return null;
        }
    }

    calculateComplexity(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\\s+/).filter(w => w.length > 0);
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = this.calculateAvgSyllables(words);
        
        // Flesch Reading Ease formula adapted
        return Math.min(10, Math.max(0, (avgWordsPerSentence + avgSyllablesPerWord) / 2));
    }

    calculateAvgSyllables(words) {
        const syllableCounts = words.map(word => this.countSyllables(word));
        return syllableCounts.reduce((sum, count) => sum + count, 0) / words.length;
    }

    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    extractKeywords(text, maxKeywords = 10) {
        const tokens = this.tokenizer.tokenize(text.toLowerCase());
        const filtered = tokens.filter(token => 
            token.length > 3 && 
            !natural.stopwords.includes(token) &&
            /^[a-zA-Z]+$/.test(token)
        );
        
        const freq = {};
        filtered.forEach(token => {
            const stem = natural.PorterStemmer.stem(token);
            freq[stem] = (freq[stem] || 0) + 1;
        });
        
        return Object.entries(freq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, maxKeywords)
            .map(([word]) => word);
    }

    classifyTopics(text) {
        const spaceBiologyTopics = {
            'microgravity': ['microgravity', 'weightless', 'zero-g', 'gravity'],
            'radiation': ['radiation', 'cosmic', 'solar', 'particle'],
            'plant-biology': ['plant', 'photosynthesis', 'root', 'leaf', 'growth'],
            'cell-biology': ['cell', 'cellular', 'mitosis', 'dna', 'protein'],
            'microbiology': ['bacteria', 'microbe', 'biofilm', 'pathogen'],
            'animal-biology': ['mouse', 'tissue', 'bone', 'muscle', 'organ']
        };
        
        const textLower = text.toLowerCase();
        const topics = [];
        
        for (const [topic, keywords] of Object.entries(spaceBiologyTopics)) {
            const score = keywords.reduce((count, keyword) => {
                const regex = new RegExp(keyword, 'gi');
                const matches = textLower.match(regex);
                return count + (matches ? matches.length : 0);
            }, 0);
            
            if (score > 0) {
                topics.push({ topic, score });
            }
        }
        
        return topics.sort((a, b) => b.score - a.score);
    }

    calculateReadabilityScore(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\\s+/).filter(w => w.length > 0);
        const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);
        
        // Flesch Reading Ease Score
        const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
        return Math.max(0, Math.min(100, score));
    }

    identifyTechnicalTerms(text) {
        const technicalTerms = [
            'microgravity', 'radiation', 'dna', 'rna', 'protein', 'enzyme',
            'gene expression', 'cell division', 'biomarker', 'metabolite',
            'transcriptome', 'proteome', 'phenotype', 'genotype',
            'spaceflight', 'astronaut', 'iss', 'payload'
        ];
        
        const textLower = text.toLowerCase();
        return technicalTerms.filter(term => textLower.includes(term));
    }

    // Predictive Analytics for Experiments
    async predictExperimentOutcome(experimentData) {
        try {
            const features = this.extractExperimentFeatures(experimentData);
            const prediction = await this.runPredictionModel(features);
            
            return {
                successProbability: prediction.probability,
                riskFactors: this.identifyRiskFactors(features),
                recommendations: this.generateRecommendations(features, prediction),
                confidenceLevel: prediction.confidence,
                factors: features
            };
        } catch (error) {
            console.error('Prediction error:', error);
            return null;
        }
    }

    extractExperimentFeatures(experiment) {
        const duration = this.parseDuration(experiment.duration);
        const categoryScore = this.getCategoryScore(experiment.category);
        const complexityScore = experiment.description ? 
            this.calculateComplexity(experiment.description) : 5;
        
        return {
            duration,
            categoryScore,
            complexityScore,
            hasPlants: this.hasPlantSubjects(experiment),
            hasRadiation: this.hasRadiationExposure(experiment),
            hasLongDuration: duration > 90,
            missionType: this.getMissionType(experiment)
        };
    }

    parseDuration(durationStr) {
        const match = durationStr.match(/\\d+/);
        return match ? parseInt(match[0]) : 30;
    }

    getCategoryScore(category) {
        const scores = {
            'Plant Biology': 0.8,
            'Cell Biology': 0.7,
            'Microbiology': 0.75,
            'Animal Biology': 0.6
        };
        return scores[category] || 0.5;
    }

    hasPlantSubjects(experiment) {
        const plantKeywords = ['plant', 'arabidopsis', 'tomato', 'lettuce', 'root', 'leaf'];
        const text = (experiment.organism + ' ' + experiment.description).toLowerCase();
        return plantKeywords.some(keyword => text.includes(keyword));
    }

    hasRadiationExposure(experiment) {
        const radiationKeywords = ['radiation', 'cosmic', 'space radiation', 'particle'];
        const text = (experiment.description + ' ' + experiment.impact).toLowerCase();
        return radiationKeywords.some(keyword => text.includes(keyword));
    }

    getMissionType(experiment) {
        const impact = experiment.impact.toLowerCase();
        if (impact.includes('mars')) return 'mars';
        if (impact.includes('moon')) return 'moon';
        return 'iss';
    }

    async runPredictionModel(features) {
        // Simple heuristic model - in production, you'd use a trained ML model
        let probability = 0.7; // Base probability
        
        // Adjust based on features
        if (features.categoryScore > 0.75) probability += 0.1;
        if (features.hasPlants) probability += 0.05;
        if (features.hasRadiation) probability -= 0.15;
        if (features.hasLongDuration) probability -= 0.1;
        if (features.complexityScore > 7) probability -= 0.05;
        
        // Mission type adjustments
        if (features.missionType === 'mars') probability -= 0.05;
        if (features.missionType === 'moon') probability += 0.02;
        
        probability = Math.max(0.1, Math.min(0.95, probability));
        
        return {
            probability: Math.round(probability * 100) / 100,
            confidence: Math.round((0.8 - Math.abs(0.5 - probability)) * 100) / 100
        };
    }

    identifyRiskFactors(features) {
        const risks = [];
        
        if (features.hasLongDuration) {
            risks.push('Extended exposure to microgravity');
        }
        if (features.hasRadiation) {
            risks.push('Radiation-induced biological stress');
        }
        if (features.complexityScore > 8) {
            risks.push('High experimental complexity');
        }
        if (features.missionType === 'mars') {
            risks.push('Deep space environment challenges');
        }
        
        return risks;
    }

    generateRecommendations(features, prediction) {
        const recommendations = [];
        
        if (prediction.probability < 0.6) {
            recommendations.push('Consider additional ground-based validation studies');
        }
        
        if (features.hasRadiation) {
            recommendations.push('Implement radiation shielding protocols');
        }
        
        if (features.hasLongDuration) {
            recommendations.push('Plan for periodic health monitoring');
            recommendations.push('Consider intermediate data collection points');
        }
        
        if (features.hasPlants) {
            recommendations.push('Monitor environmental conditions closely');
            recommendations.push('Prepare backup specimens');
        }
        
        if (features.complexityScore > 7) {
            recommendations.push('Simplify experimental design where possible');
            recommendations.push('Increase automation to reduce human error');
        }
        
        return recommendations;
    }

    // Data Pattern Analysis
    async analyzeDataPatterns(dataPoints) {
        try {
            if (!dataPoints || dataPoints.length === 0) return null;
            
            const analysis = {
                trends: this.identifyTrends(dataPoints),
                anomalies: this.detectAnomalies(dataPoints),
                correlations: this.findCorrelations(dataPoints),
                quality: this.assessDataQuality(dataPoints),
                insights: []
            };
            
            analysis.insights = this.generateInsights(analysis);
            
            return analysis;
        } catch (error) {
            console.error('Data pattern analysis error:', error);
            return null;
        }
    }

    identifyTrends(dataPoints) {
        const trends = {};
        const groupedByType = this.groupDataByType(dataPoints);
        
        for (const [type, points] of Object.entries(groupedByType)) {
            if (points.length < 3) continue;
            
            const values = points.map(p => parseFloat(p.value)).filter(v => !isNaN(v));
            if (values.length < 3) continue;
            
            const trend = this.calculateTrend(values);
            trends[type] = trend;
        }
        
        return trends;
    }

    groupDataByType(dataPoints) {
        const grouped = {};
        dataPoints.forEach(point => {
            if (!grouped[point.measurementType]) {
                grouped[point.measurementType] = [];
            }
            grouped[point.measurementType].push(point);
        });
        return grouped;
    }

    calculateTrend(values) {
        if (values.length < 2) return { direction: 'stable', strength: 0 };
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
        const sumX2 = values.reduce((sum, val, i) => sum + (i * i), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const strength = Math.abs(slope);
        
        let direction = 'stable';
        if (slope > 0.1) direction = 'increasing';
        else if (slope < -0.1) direction = 'decreasing';
        
        return { direction, strength: Math.round(strength * 100) / 100 };
    }

    detectAnomalies(dataPoints) {
        const anomalies = [];
        const groupedByType = this.groupDataByType(dataPoints);
        
        for (const [type, points] of Object.entries(groupedByType)) {
            const values = points.map(p => parseFloat(p.value)).filter(v => !isNaN(v));
            if (values.length < 5) continue;
            
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const threshold = 2.5 * stdDev;
            
            points.forEach((point, index) => {
                const value = parseFloat(point.value);
                if (!isNaN(value) && Math.abs(value - mean) > threshold) {
                    anomalies.push({
                        pointId: point._id,
                        type,
                        value,
                        expectedRange: [mean - threshold, mean + threshold],
                        deviation: Math.abs(value - mean) / stdDev
                    });
                }
            });
        }
        
        return anomalies;
    }

    findCorrelations(dataPoints) {
        const correlations = [];
        const groupedByType = this.groupDataByType(dataPoints);
        const types = Object.keys(groupedByType);
        
        for (let i = 0; i < types.length; i++) {
            for (let j = i + 1; j < types.length; j++) {
                const correlation = this.calculateCorrelation(
                    groupedByType[types[i]],
                    groupedByType[types[j]]
                );
                
                if (Math.abs(correlation) > 0.5) {
                    correlations.push({
                        type1: types[i],
                        type2: types[j],
                        correlation: Math.round(correlation * 100) / 100,
                        strength: this.getCorrelationStrength(correlation)
                    });
                }
            }
        }
        
        return correlations;
    }

    calculateCorrelation(points1, points2) {
        // Simplified correlation calculation
        const minLength = Math.min(points1.length, points2.length);
        if (minLength < 3) return 0;
        
        const values1 = points1.slice(0, minLength).map(p => parseFloat(p.value));
        const values2 = points2.slice(0, minLength).map(p => parseFloat(p.value));
        
        const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
        const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < values1.length; i++) {
            const diff1 = values1[i] - mean1;
            const diff2 = values2[i] - mean2;
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator === 0 ? 0 : numerator / denominator;
    }

    getCorrelationStrength(correlation) {
        const abs = Math.abs(correlation);
        if (abs > 0.8) return 'very strong';
        if (abs > 0.6) return 'strong';
        if (abs > 0.4) return 'moderate';
        if (abs > 0.2) return 'weak';
        return 'very weak';
    }

    assessDataQuality(dataPoints) {
        let qualityScore = 1.0;
        let issues = [];
        
        // Check for missing values
        const missingCount = dataPoints.filter(p => !p.value || p.value === null).length;
        if (missingCount > 0) {
            const missingRate = missingCount / dataPoints.length;
            qualityScore -= missingRate * 0.3;
            issues.push(`${Math.round(missingRate * 100)}% missing values`);
        }
        
        // Check for duplicate timestamps
        const timestamps = dataPoints.map(p => p.timestamp.getTime());
        const uniqueTimestamps = new Set(timestamps);
        if (uniqueTimestamps.size !== timestamps.length) {
            qualityScore -= 0.1;
            issues.push('Duplicate timestamps detected');
        }
        
        // Check for reasonable value ranges
        const numericValues = dataPoints
            .map(p => parseFloat(p.value))
            .filter(v => !isNaN(v));
        
        if (numericValues.length > 0) {
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            if (max - min === 0) {
                qualityScore -= 0.2;
                issues.push('No variation in values');
            }
        }
        
        return {
            score: Math.max(0, qualityScore),
            issues,
            totalPoints: dataPoints.length,
            missingPoints: missingCount
        };
    }

    generateInsights(analysis) {
        const insights = [];
        
        // Trend insights
        for (const [type, trend] of Object.entries(analysis.trends)) {
            if (trend.strength > 0.5) {
                insights.push(`${type} shows ${trend.direction} trend with ${trend.strength} strength`);
            }
        }
        
        // Anomaly insights
        if (analysis.anomalies.length > 0) {
            insights.push(`Detected ${analysis.anomalies.length} potential anomalies requiring investigation`);
        }
        
        // Correlation insights
        analysis.correlations.forEach(corr => {
            insights.push(`${corr.strength} correlation found between ${corr.type1} and ${corr.type2}`);
        });
        
        // Quality insights
        if (analysis.quality.score < 0.8) {
            insights.push(`Data quality needs improvement (score: ${Math.round(analysis.quality.score * 100)}%)`);
        }
        
        return insights;
    }
}

module.exports = new SpaceBiologyAI();
"""

# Create services directory and file
if not os.path.exists('services'):
    os.makedirs('services')

with open("services/ai-services.js", "w") as f:
    f.write(ai_services_js)

print("✅ AI/ML services created with comprehensive analysis capabilities")