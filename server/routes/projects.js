import express from 'express';
import Project from '../models/Project.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, subject, dueDate } = req.body;

    const project = new Project({
      title,
      description,
      subject,
      dueDate,
      createdBy: req.userId,
      members: [{ userId: req.userId, role: 'Lead' }],
    });

    await project.save();
    await project.populate('createdBy members.userId');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects (user is member)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { 'members.userId': req.userId };

    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single project
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .populate('tasks.assignedTo', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member
    const isMember = project.members.some((m) => m.userId._id.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add member to project
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is lead
    const isLead = project.members.some(
      (m) => m.userId.toString() === req.userId && m.role === 'Lead'
    );
    if (!isLead && project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only lead can add members' });
    }

    // Check if member already exists
    const memberExists = project.members.some(
      (m) => m.userId.toString() === userId
    );
    if (memberExists) {
      return res.status(400).json({ message: 'Member already in project' });
    }

    project.members.push({ userId, role: 'Member' });
    await project.save();
    await project.populate('members.userId', 'name email');

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is lead
    const isLead = project.members.some(
      (m) => m.userId.toString() === req.userId && m.role === 'Lead'
    );
    if (!isLead && project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only lead can update project' });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only creator can delete
    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only creator can delete project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
