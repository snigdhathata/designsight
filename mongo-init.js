// MongoDB initialization script
db = db.getSiblingDB('designsight');

// Create collections
db.createCollection('users');
db.createCollection('projects');
db.createCollection('designs');
db.createCollection('comments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.projects.createIndex({ "owner": 1 });
db.projects.createIndex({ "collaborators.user": 1 });
db.projects.createIndex({ "status": 1 });

db.designs.createIndex({ "project": 1 });
db.designs.createIndex({ "uploadedBy": 1 });
db.designs.createIndex({ "aiAnalysis.status": 1 });

db.comments.createIndex({ "design": 1, "feedbackItemId": 1 });
db.comments.createIndex({ "author": 1 });
db.comments.createIndex({ "parentComment": 1 });

print('DesignSight database initialized successfully');


