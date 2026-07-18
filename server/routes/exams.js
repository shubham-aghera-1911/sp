import express from 'express';
import Exam from '../models/Exam.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create exam
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, examDate, examTime, duration, location, examType, maxMarks } = req.body;

    const exam = new Exam({
      userId: req.userId,
      subject,
      examDate,
      examTime,
      duration,
      location,
      examType,
      maxMarks,
    });

    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all exams (with countdown calculation)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.userId }).sort({ examDate: 1 });

    const examsWithCountdown = exams.map((exam) => {
      const now = new Date();
      const examDateTime = new Date(exam.examDate);
      const timeLeft = examDateTime - now;
      const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

      return {
        ...exam.toObject(),
        daysLeft,
        hoursLeft,
        isUpcoming: timeLeft > 0,
      };
    });

    res.status(200).json(examsWithCountdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single exam
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, userId: req.userId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update exam
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete exam
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.status(200).json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
