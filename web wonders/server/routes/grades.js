import express from "express";
import Grade from "../models/Grade.js";

const router = express.Router();

const GRADE_PTS = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, F: 0.0,
};

function calcGPA(grades) {
  if (!grades.length) return 0;
  const points = grades.reduce((s, g) => s + (GRADE_PTS[g.grade] ?? 0) * g.credits, 0);
  const credits = grades.reduce((s, g) => s + g.credits, 0);
  return credits ? points / credits : 0;
}

router.get("/", async (req, res) => {
  const items = await Grade.find({ user: req.userId }).sort({ semester: 1 });
  res.json(items);
});

// GET /api/grades/gpa -> cumulative + per-semester breakdown
router.get("/gpa", async (req, res) => {
  const items = await Grade.find({ user: req.userId });
  const semesters = [...new Set(items.map((g) => g.semester))];
  const bySemester = semesters.map((sem) => ({
    semester: sem,
    gpa: calcGPA(items.filter((g) => g.semester === sem)),
  }));
  res.json({ cumulativeGPA: calcGPA(items), bySemester });
});

router.post("/", async (req, res) => {
  try {
    const { subject, credits, grade, semester } = req.body;
    if (!subject || !credits || !grade || !semester) {
      return res.status(400).json({ message: "subject, credits, grade and semester are required" });
    }
    const item = await Grade.create({ user: req.userId, subject, credits, grade, semester });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await Grade.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Grade not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const item = await Grade.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Grade not found" });
  res.json({ message: "Deleted" });
});

export default router;
