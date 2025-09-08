const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['designer', 'reviewer', 'product_manager', 'developer']
    },
    permissions: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  settings: {
    aiAnalysisEnabled: {
      type: Boolean,
      default: true
    },
    autoAnalysis: {
      type: Boolean,
      default: false
    },
    feedbackCategories: [{
      type: String,
      enum: ['accessibility', 'visual_hierarchy', 'content', 'ui_patterns']
    }]
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ 'collaborators.user': 1 });

module.exports = mongoose.model('Project', projectSchema);


