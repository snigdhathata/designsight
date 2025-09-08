const express = require('express');
const Comment = require('../models/Comment');
const Design = require('../models/Design');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get comments for a feedback item
router.get('/design/:designId/feedback/:feedbackItemId', auth, async (req, res) => {
  try {
    const { designId, feedbackItemId } = req.params;

    // Check if user has access to the design
    const design = await Design.findById(designId).populate('project');
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const project = design.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
      project.collaborators.some(collab => 
        collab.user.toString() === req.user._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comments = await Comment.find({
      design: designId,
      feedbackItemId
    })
    .populate('author', 'name email role')
    .populate('mentions', 'name email')
    .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new comment
router.post('/design/:designId/feedback/:feedbackItemId', auth, async (req, res) => {
  try {
    const { designId, feedbackItemId } = req.params;
    const { content, parentComment } = req.body;

    // Check if user has access to the design
    const design = await Design.findById(designId).populate('project');
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const project = design.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
      project.collaborators.some(collab => 
        collab.user.toString() === req.user._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = new Comment({
      design: designId,
      feedbackItemId,
      author: req.user._id,
      content,
      parentComment: parentComment || null
    });

    await comment.save();
    await comment.populate('author', 'name email role');

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a comment
router.put('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name email role');

    res.json({ comment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Also delete any replies to this comment
    await Comment.deleteMany({ parentComment: commentId });
    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to comment
router.post('/:commentId/reactions', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Remove existing reaction from this user
    comment.reactions = comment.reactions.filter(
      reaction => reaction.user.toString() !== req.user._id.toString()
    );

    // Add new reaction
    comment.reactions.push({
      user: req.user._id,
      type
    });

    await comment.save();
    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark comment as resolved
router.patch('/:commentId/resolve', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isResolved = true;
    await comment.save();

    res.json({ message: 'Comment marked as resolved' });
  } catch (error) {
    console.error('Resolve comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


