import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Note.find({ user: req.userId }).sort({ pinned: -1, updatedAt: -1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { title, subject, content, pinned } = req.body;
    const item = await Note.create({
      user: req.userId,
      title: title || "Untitled Note",
      subject: subject || "General",
      content: content || "",
      pinned: pinned || false,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await Note.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Note not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const item = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Deleted" });
});

export default router;
