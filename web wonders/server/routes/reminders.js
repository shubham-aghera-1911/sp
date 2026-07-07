import express from "express";
import Reminder from "../models/Reminder.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Reminder.find({ user: req.userId }).sort({ date: 1, time: 1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { title, date, time, type } = req.body;
    if (!title || !date || !time) {
      return res.status(400).json({ message: "title, date and time are required" });
    }
    const item = await Reminder.create({ user: req.userId, title, date, time, type });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await Reminder.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Reminder not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const item = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Reminder not found" });
  res.json({ message: "Deleted" });
});

export default router;
