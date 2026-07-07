import express from "express";
import StudySession from "../models/StudySession.js";

const router = express.Router();

// GET /api/timer -> session history + totals
router.get("/", async (req, res) => {
  const sessions = await StudySession.find({ user: req.userId }).sort({ completedAt: -1 });
  const totalMinutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  res.json({ sessions, totalMinutes, totalSessions: sessions.length });
});

// POST /api/timer -> log a completed pomodoro/focus session
router.post("/", async (req, res) => {
  try {
    const { subject, durationMinutes } = req.body;
    if (!durationMinutes) return res.status(400).json({ message: "durationMinutes is required" });
    const session = await StudySession.create({ user: req.userId, subject, durationMinutes });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
