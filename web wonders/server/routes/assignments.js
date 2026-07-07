import express from "express";
import Assignment from "../models/Assignment.js";

const router = express.Router();

// GET /api/assignments
router.get("/", async (req, res) => {
  const items = await Assignment.find({ user: req.userId }).sort({ dueDate: 1 });
  res.json(items);
});

// POST /api/assignments
router.post("/", async (req, res) => {
  try {
    const { title, subject, dueDate, priority, type } = req.body;
    if (!title || !subject || !dueDate) {
      return res.status(400).json({ message: "title, subject and dueDate are required" });
    }
    const item = await Assignment.create({ user: req.userId, title, subject, dueDate, priority, type });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/assignments/:id
router.put("/:id", async (req, res) => {
  const item = await Assignment.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ message: "Assignment not found" });
  res.json(item);
});

// DELETE /api/assignments/:id
router.delete("/:id", async (req, res) => {
  const item = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Assignment not found" });
  res.json({ message: "Deleted" });
});

export default router;
