// MongoDB initialization script for NASA Space Biology Dashboard

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
