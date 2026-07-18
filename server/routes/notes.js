import express from 'express';
import Note from '../models/Note.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, subject, category, tags, color, isPinned } = req.body;

    const note = new Note({
      userId: req.userId,
      title,
      content,
      subject,
      category,
      tags,
      color,
      isPinned,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all notes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { subject, category, isPinned } = req.query;
    const filter = { userId: req.userId };

    if (subject) filter.subject = subject;
    if (category) filter.category = category;
    if (isPinned === 'true') filter.isPinned = true;

    const notes = await Note.find(filter).sort({
      isPinned: -1,
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search notes
router.get('/search/:query', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.userId,
      $or: [
        { title: { $regex: req.params.query, $options: 'i' } },
        { content: { $regex: req.params.query, $options: 'i' } },
        { tags: { $in: [new RegExp(req.params.query, 'i')] } },
      ],
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single note
router.get('/view/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
