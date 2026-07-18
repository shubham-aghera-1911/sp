import express from 'express';
import Assignment from '../models/Assignment.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create assignment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, subject, dueDate, priority, maxMarks, notes } = req.body;

    const assignment = new Assignment({
      userId: req.userId,
      title,
      description,
      subject,
      dueDate,
      priority,
      maxMarks,
      notes,
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assignments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, priority, subject } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;

    const assignments = await Assignment.find(filter).sort({ dueDate: 1 });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single assignment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update assignment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete assignment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
