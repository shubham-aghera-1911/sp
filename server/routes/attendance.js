import express from 'express';
import Attendance from '../models/Attendance.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Mark attendance
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, date, status, notes } = req.body;

    const attendance = new Attendance({
      userId: req.userId,
      subject,
      date,
      status,
      notes,
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for all subjects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const attendances = await Attendance.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const attendances = await Attendance.find({ userId: req.userId });

    // Calculate attendance by subject
    const subjectStats = {};
    attendances.forEach((att) => {
      if (!subjectStats[att.subject]) {
        subjectStats[att.subject] = { present: 0, absent: 0, leave: 0, total: 0 };
      }
      subjectStats[att.subject][att.status.toLowerCase()]++;
      subjectStats[att.subject].total++;
    });

    // Calculate percentages
    const stats = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      presentPercentage: Math.round((data.present / data.total) * 100),
      totalClasses: data.total,
      present: data.present,
      absent: data.absent,
      leave: data.leave,
    }));

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for specific subject
router.get('/:subject', authMiddleware, async (req, res) => {
  try {
    const attendances = await Attendance.find({
      userId: req.userId,
      subject: req.params.subject,
    }).sort({ date: -1 });

    if (attendances.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update attendance
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
