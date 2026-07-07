import express from "express";
import TimetableSlot from "../models/TimetableSlot.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await TimetableSlot.find({ user: req.userId }).sort({ time: 1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { day, time, end, subject, room, type } = req.body;
    if (!day || !time || !end || !subject) {
      return res.status(400).json({ message: "day, time, end and subject are required" });
    }
    const item = await TimetableSlot.create({ user: req.userId, day, time, end, subject, room, type });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await TimetableSlot.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Slot not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const item = await TimetableSlot.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Slot not found" });
  res.json({ message: "Deleted" });
});

export default router;
