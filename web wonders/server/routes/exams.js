import express from "express";
import Exam from "../models/Exam.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Exam.find({ user: req.userId }).sort({ date: 1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { subject, date, time, room, color } = req.body;
    if (!subject || !date || !time) {
      return res.status(400).json({ message: "subject, date and time are required" });
    }
    const item = await Exam.create({ user: req.userId, subject, date, time, room, color });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await Exam.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Exam not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const item = await Exam.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Exam not found" });
  res.json({ message: "Deleted" });
});

export default router;
