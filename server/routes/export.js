const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const Design = require('../models/Design');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Export feedback as PDF
router.get('/design/:designId/pdf', auth, async (req, res) => {
  try {
    const { designId } = req.params;
    const { role } = req.query;

    const design = await Design.findById(designId).populate('project');
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check access
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

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="design-feedback-${designId}.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Design Feedback Report', 50, 50);
    doc.fontSize(12).text(`Project: ${project.name}`, 50, 80);
    doc.text(`Design: ${design.originalName}`, 50, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 120);
    doc.text(`Role Filter: ${role || 'All'}`, 50, 140);

    // Summary
    if (design.aiAnalysis?.analysisData?.summary) {
      doc.fontSize(14).text('Summary', 50, 180);
      doc.fontSize(10).text(design.aiAnalysis.analysisData.summary, 50, 200, {
        width: 500,
        align: 'left'
      });
    }

    // Overall Score
    if (design.aiAnalysis?.analysisData?.overallScore) {
      doc.fontSize(14).text('Overall Score', 50, 250);
      doc.fontSize(16).text(`${design.aiAnalysis.analysisData.overallScore}/100`, 50, 270);
    }

    // Feedback Items
    doc.fontSize(14).text('Feedback Items', 50, 320);
    
    let yPosition = 350;
    feedbackItems.forEach((item, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      // Item header
      doc.fontSize(12).text(`${index + 1}. ${item.title}`, 50, yPosition);
      doc.fontSize(10).text(`Category: ${item.category} | Severity: ${item.severity}`, 50, yPosition + 15);
      
      // Description
      doc.text(item.description, 50, yPosition + 35, {
        width: 500,
        align: 'left'
      });

      // Coordinates
      doc.text(`Location: x:${item.coordinates.x}, y:${item.coordinates.y}, w:${item.coordinates.width}, h:${item.coordinates.height}`, 50, yPosition + 55);

      // Recommendations
      if (item.recommendations && item.recommendations.length > 0) {
        doc.text('Recommendations:', 50, yPosition + 75);
        item.recommendations.forEach((rec, recIndex) => {
          doc.text(`• ${rec}`, 70, yPosition + 90 + (recIndex * 15));
        });
        yPosition += 90 + (item.recommendations.length * 15);
      } else {
        yPosition += 90;
      }

      yPosition += 20;
    });

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export feedback as JSON
router.get('/design/:designId/json', auth, async (req, res) => {
  try {
    const { designId } = req.params;
    const { role } = req.query;

    const design = await Design.findById(designId).populate('project');
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check access
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

    const exportData = {
      project: {
        id: project._id,
        name: project.name
      },
      design: {
        id: design._id,
        filename: design.filename,
        originalName: design.originalName,
        dimensions: design.dimensions,
        uploadedAt: design.createdAt
      },
      analysis: {
        status: design.aiAnalysis?.status,
        overallScore: design.aiAnalysis?.analysisData?.overallScore,
        summary: design.aiAnalysis?.analysisData?.summary,
        generatedAt: design.aiAnalysis?.completedAt
      },
      feedbackItems,
      export: {
        generatedAt: new Date().toISOString(),
        roleFilter: role || 'all',
        totalItems: feedbackItems.length
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="design-feedback-${designId}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


