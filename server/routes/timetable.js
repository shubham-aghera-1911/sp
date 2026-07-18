import express from 'express';
import Timetable from '../models/Timetable.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create timetable entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { dayOfWeek, subject, startTime, endTime, classroom, instructor, semester, color } = req.body;

    const timetable = new Timetable({
      userId: req.userId,
      dayOfWeek,
      subject,
      startTime,
      endTime,
      classroom,
      instructor,
      semester,
      color,
    });

    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get full timetable
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { semester } = req.query;
    const filter = { userId: req.userId };

    if (semester) filter.semester = parseInt(semester);

    const timetable = await Timetable.find(filter).sort({
      dayOfWeek: 1,
      startTime: 1,
    });

    // Organize by day
    const organizedTimetable = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    days.forEach((day) => {
      organizedTimetable[day] = timetable.filter((t) => t.dayOfWeek === day);
    });

    res.status(200).json(organizedTimetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's schedule
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const todaySchedule = await Timetable.find({
      userId: req.userId,
      dayOfWeek: today,
    }).sort({ startTime: 1 });

    res.status(200).json(todaySchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update timetable entry
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const timetable = await Timetable.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete timetable entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const timetable = await Timetable.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }
    res.status(200).json({ message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
