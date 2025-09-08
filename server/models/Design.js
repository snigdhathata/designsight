const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  dimensions: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiAnalysis: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    error: String,
    analysisData: {
      feedbackItems: [{
        id: String,
        category: {
          type: String,
          enum: ['accessibility', 'visual_hierarchy', 'content', 'ui_patterns']
        },
        severity: {
          type: String,
          enum: ['high', 'medium', 'low']
        },
        title: String,
        description: String,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number
        },
        recommendations: [String],
        tags: [String],
        relevantRoles: [{
          type: String,
          enum: ['designer', 'reviewer', 'product_manager', 'developer']
        }]
      }],
      overallScore: Number,
      summary: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
designSchema.index({ project: 1, status: 1 });
designSchema.index({ 'aiAnalysis.status': 1 });
designSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Design', designSchema);


