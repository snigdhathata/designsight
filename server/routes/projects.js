const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const Project = require('../models/Project');
const Design = require('../models/Design');
const { auth } = require('../middleware/auth');
const aiAnalysisService = require('../services/aiAnalysis');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email role')
    .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      settings: settings || {}
    });

    await project.save();
    await project.populate('owner', 'name email');

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description, settings } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (settings) project.settings = { ...project.settings, ...settings };

    await project.save();
    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload design to project
router.post('/:id/designs', auth, upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id, 'collaborators.permissions': { $in: ['write', 'admin'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get image dimensions
    const dimensions = await aiAnalysisService.getImageDimensions(req.file.path);

    // Create design record
    const design = new Design({
      project: project._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      dimensions,
      uploadedBy: req.user._id
    });

    await design.save();

    // Start AI analysis if enabled
    if (project.settings.aiAnalysisEnabled) {
      design.aiAnalysis.status = 'processing';
      design.aiAnalysis.startedAt = new Date();
      await design.save();

      // Run AI analysis asynchronously
      aiAnalysisService.analyzeDesign(req.file.path, dimensions)
        .then(async (analysisData) => {
          design.aiAnalysis.status = 'completed';
          design.aiAnalysis.completedAt = new Date();
          design.aiAnalysis.analysisData = analysisData;
          await design.save();
        })
        .catch(async (error) => {
          console.error('AI Analysis failed:', error);
          design.aiAnalysis.status = 'failed';
          design.aiAnalysis.error = error.message;
          await design.save();
        });
    }

    res.status(201).json({ design });
  } catch (error) {
    console.error('Upload design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get designs for project
router.get('/:id/designs', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const designs = await Design.find({ project: project._id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ designs });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add collaborator to project
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { userId, role, permissions } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    project.collaborators.push({
      user: userId,
      role: role || 'designer',
      permissions: permissions || 'read'
    });

    await project.save();
    res.json({ project });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


