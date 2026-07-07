import express from "express";
import Attendance from "../models/Attendance.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Attendance.find({ user: req.userId }).sort({ subject: 1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { subject, attended, total, color } = req.body;
    if (!subject) return res.status(400).json({ message: "subject is required" });
    const item = await Attendance.create({
      user: req.userId,
      subject,
      attended: attended ?? 0,
      total: total ?? 0,
      color,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Mark present/absent, or general update
router.put("/:id", async (req, res) => {
  const item = await Attendance.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Attendance record not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const item = await Attendance.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Attendance record not found" });
  res.json({ message: "Deleted" });
});

export default router;
