const express = require('express');
const Design = require('../models/Design');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get feedback for a design
router.get('/design/:designId', auth, async (req, res) => {
  try {
    const { designId } = req.params;
    const { role } = req.query;

    const design = await Design.findById(designId)
      .populate('project', 'name')
      .populate('uploadedBy', 'name email');

    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user has access to the project
    const project = design.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
      project.collaborators.some(collab => 
        collab.user.toString() === req.user._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let feedbackItems = design.aiAnalysis?.analysisData?.feedbackItems || [];

    // Filter by role if specified
    if (role && role !== 'all') {
      feedbackItems = feedbackItems.filter(item => 
        item.relevantRoles.includes(role)
      );
    }

    // Filter by category if specified
    const { category } = req.query;
    if (category) {
      feedbackItems = feedbackItems.filter(item => 
        item.category === category
      );
    }

    // Filter by severity if specified
    const { severity } = req.query;
    if (severity) {
      feedbackItems = feedbackItems.filter(item => 
        item.severity === severity
      );
    }

    res.json({
      design: {
        id: design._id,
        filename: design.filename,
        originalName: design.originalName,
        dimensions: design.dimensions,
        uploadedBy: design.uploadedBy,
        project: design.project
      },
      feedbackItems,
      analysisStatus: design.aiAnalysis?.status,
      overallScore: design.aiAnalysis?.analysisData?.overallScore,
      summary: design.aiAnalysis?.analysisData?.summary
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feedback statistics for a design
router.get('/design/:designId/stats', auth, async (req, res) => {
  try {
    const { designId } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const feedbackItems = design.aiAnalysis?.analysisData?.feedbackItems || [];
    
    const stats = {
      total: feedbackItems.length,
      byCategory: {
        accessibility: feedbackItems.filter(item => item.category === 'accessibility').length,
        visual_hierarchy: feedbackItems.filter(item => item.category === 'visual_hierarchy').length,
        content: feedbackItems.filter(item => item.category === 'content').length,
        ui_patterns: feedbackItems.filter(item => item.category === 'ui_patterns').length
      },
      bySeverity: {
        high: feedbackItems.filter(item => item.severity === 'high').length,
        medium: feedbackItems.filter(item => item.severity === 'medium').length,
        low: feedbackItems.filter(item => item.severity === 'low').length
      },
      byRole: {
        designer: feedbackItems.filter(item => item.relevantRoles.includes('designer')).length,
        reviewer: feedbackItems.filter(item => item.relevantRoles.includes('reviewer')).length,
        product_manager: feedbackItems.filter(item => item.relevantRoles.includes('product_manager')).length,
        developer: feedbackItems.filter(item => item.relevantRoles.includes('developer')).length
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retry AI analysis for a design
router.post('/design/:designId/retry-analysis', auth, async (req, res) => {
  try {
    const { designId } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user has write access
    const project = await design.populate('project');
    const hasWriteAccess = project.owner.toString() === req.user._id.toString() ||
      project.collaborators.some(collab => 
        collab.user.toString() === req.user._id.toString() && 
        ['write', 'admin'].includes(collab.permissions)
      );

    if (!hasWriteAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Reset analysis status
    design.aiAnalysis.status = 'processing';
    design.aiAnalysis.startedAt = new Date();
    design.aiAnalysis.error = null;
    await design.save();

    // Start new analysis
    const aiAnalysisService = require('../services/aiAnalysis');
    aiAnalysisService.analyzeDesign(design.filePath, design.dimensions)
      .then(async (analysisData) => {
        design.aiAnalysis.status = 'completed';
        design.aiAnalysis.completedAt = new Date();
        design.aiAnalysis.analysisData = analysisData;
        await design.save();
      })
      .catch(async (error) => {
        console.error('Retry AI Analysis failed:', error);
        design.aiAnalysis.status = 'failed';
        design.aiAnalysis.error = error.message;
        await design.save();
      });

    res.json({ message: 'Analysis restarted successfully' });
  } catch (error) {
    console.error('Retry analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


