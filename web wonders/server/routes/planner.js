import express from "express";
import Assignment from "../models/Assignment.js";
import Exam from "../models/Exam.js";

const router = express.Router();

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS = ["07:00–08:00", "13:00–14:00", "16:00–17:00", "18:00–19:00", "19:00–20:00"];

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / 86400000);
}

// GET /api/planner -> auto-generates a 7-day study plan from the user's
// pending assignments and upcoming exams, prioritizing the most urgent items.
router.get("/", async (req, res) => {
  const [assignments, exams] = await Promise.all([
    Assignment.find({ user: req.userId, done: false }),
    Exam.find({ user: req.userId }),
  ]);

  const items = [
    ...assignments.map((a) => ({
      subject: a.subject,
      topic: `Work on: ${a.title}`,
      urgency: daysUntil(a.dueDate),
      intensity: a.priority === "high" ? "High" : a.priority === "medium" ? "Medium" : "Low",
    })),
    ...exams.map((e) => ({
      subject: e.subject,
      topic: `Revise for upcoming exam`,
      urgency: daysUntil(e.date),
      intensity: "High",
    })),
  ]
    .filter((i) => i.urgency >= 0)
    .sort((a, b) => a.urgency - b.urgency);

  const plan = DAYS.map((day, dayIdx) => {
    const dayItems = items.filter((_, i) => i % 7 === dayIdx).slice(0, 2);
    return {
      day,
      sessions: dayItems.map((item, i) => ({
        time: SLOTS[i % SLOTS.length],
        subject: item.subject,
        topic: item.topic,
        intensity: item.intensity,
      })),
    };
  });

  res.json({ plan, note: "Generated with a rule-based planner from your assignments and exams. Add an AI API key on the server to upgrade this to LLM-generated plans." });
});

export default router;
