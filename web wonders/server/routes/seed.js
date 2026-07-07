import express from "express";
import Assignment from "../models/Assignment.js";
import Exam from "../models/Exam.js";
import Attendance from "../models/Attendance.js";
import Note from "../models/Note.js";
import Project from "../models/Project.js";
import Grade from "../models/Grade.js";
import Reminder from "../models/Reminder.js";
import TimetableSlot from "../models/TimetableSlot.js";

const router = express.Router();

// POST /api/seed -> only seeds if the account has no assignments yet,
// so it's safe to call this every time right after login/register.
router.post("/", async (req, res) => {
  const userId = req.userId;
  const existing = await Assignment.countDocuments({ user: userId });
  if (existing > 0) {
    return res.json({ seeded: false, message: "Account already has data" });
  }

  await Promise.all([
    Assignment.insertMany([
      { user: userId, title: "Research Paper: Climate Change Impact", subject: "Environmental Science", dueDate: "2026-07-10", priority: "high", done: false, type: "Essay" },
      { user: userId, title: "Problem Set 5 — Linear Algebra", subject: "Mathematics", dueDate: "2026-07-08", priority: "high", done: false, type: "Homework" },
      { user: userId, title: "Lab Report: Titration Experiment", subject: "Chemistry", dueDate: "2026-07-12", priority: "medium", done: true, type: "Lab" },
      { user: userId, title: "Case Study: Supply Chain Management", subject: "Business Studies", dueDate: "2026-07-15", priority: "medium", done: false, type: "Case Study" },
      { user: userId, title: "Presentation: Neural Networks", subject: "Computer Science", dueDate: "2026-07-09", priority: "high", done: false, type: "Presentation" },
      { user: userId, title: "Reading Summary: Chapters 8–10", subject: "Literature", dueDate: "2026-07-07", priority: "low", done: true, type: "Reading" },
    ]),
    Exam.insertMany([
      { user: userId, subject: "Mathematics", date: "2026-07-18", time: "9:00 AM", room: "Hall A — 201", color: "#7c3aed" },
      { user: userId, subject: "Computer Science", date: "2026-07-22", time: "2:00 PM", room: "Lab Block 3", color: "#0ea5e9" },
      { user: userId, subject: "Environmental Science", date: "2026-07-25", time: "10:30 AM", room: "Hall B — 105", color: "#10b981" },
      { user: userId, subject: "Chemistry", date: "2026-08-01", time: "9:00 AM", room: "Hall A — 302", color: "#f59e0b" },
      { user: userId, subject: "Business Studies", date: "2026-08-05", time: "11:00 AM", room: "Hall C — 210", color: "#ef4444" },
    ]),
    Attendance.insertMany([
      { user: userId, subject: "Mathematics", attended: 22, total: 24, color: "#7c3aed" },
      { user: userId, subject: "Computer Science", attended: 20, total: 22, color: "#0ea5e9" },
      { user: userId, subject: "Environmental Science", attended: 14, total: 20, color: "#10b981" },
      { user: userId, subject: "Chemistry", attended: 18, total: 20, color: "#f59e0b" },
      { user: userId, subject: "Business Studies", attended: 19, total: 22, color: "#ef4444" },
      { user: userId, subject: "Literature", attended: 21, total: 24, color: "#ec4899" },
    ]),
    Note.insertMany([
      { user: userId, title: "Eigenvalues & Eigenvectors", subject: "Mathematics", pinned: true, content: "An eigenvector v of a linear transformation T satisfies Tv = \u03bbv, where \u03bb is the eigenvalue.\n\nKey methods:\n\u2022 Characteristic polynomial: det(A \u2212 \u03bbI) = 0\n\u2022 Find null space of (A \u2212 \u03bbI)\n\nApplications: PCA, quantum mechanics, PageRank algorithm, vibration analysis in engineering." },
      { user: userId, title: "Neural Network Architectures", subject: "Computer Science", pinned: true, content: "CNN \u2192 Convolutional layers extract spatial features (image tasks)\nRNN / LSTM \u2192 Sequential data, long-term dependencies\nTransformer \u2192 Self-attention mechanism, parallelizable (NLP/vision)" },
      { user: userId, title: "Carbon Cycle Summary", subject: "Environmental Science", pinned: false, content: "Photosynthesis: CO2 + H2O \u2192 glucose + O2 (carbon fixation)\nRespiration: glucose + O2 \u2192 CO2 + H2O (carbon release)" },
      { user: userId, title: "Acid-Base Reactions", subject: "Chemistry", pinned: false, content: "Br\u00f8nsted-Lowry definition: acids donate H+, bases accept H+\n\npH = \u2212log[H+]" },
    ]),
    Project.insertMany([
      {
        user: userId, name: "Climate Data Visualization", subject: "Environmental Science", deadline: "2026-07-20",
        members: ["Alex K.", "Maya P.", "You", "Jordan L."],
        tasks: [
          { title: "Collect global temperature dataset", done: true, assignee: "Alex K." },
          { title: "Build interactive choropleth map", done: true, assignee: "You" },
          { title: "Write statistical analysis section", done: false, assignee: "Maya P." },
          { title: "Design final presentation poster", done: false, assignee: "Jordan L." },
          { title: "Peer-review team draft", done: false, assignee: "You" },
        ],
      },
      {
        user: userId, name: "E-Commerce Platform Prototype", subject: "Computer Science", deadline: "2026-07-28",
        members: ["Sam R.", "You", "Chris M."],
        tasks: [
          { title: "Design normalized database schema", done: true, assignee: "You" },
          { title: "Implement REST API endpoints", done: true, assignee: "Chris M." },
          { title: "Build React frontend components", done: false, assignee: "Sam R." },
          { title: "Implement JWT authentication", done: false, assignee: "You" },
          { title: "End-to-end testing suite", done: false, assignee: "Chris M." },
        ],
      },
    ]),
    Grade.insertMany([
      { user: userId, subject: "Calculus II", credits: 4, grade: "A", semester: "Fall 2025" },
      { user: userId, subject: "Intro to CS", credits: 3, grade: "A+", semester: "Fall 2025" },
      { user: userId, subject: "Physics I", credits: 4, grade: "B+", semester: "Fall 2025" },
      { user: userId, subject: "English Composition", credits: 3, grade: "A-", semester: "Fall 2025" },
      { user: userId, subject: "Linear Algebra", credits: 3, grade: "B+", semester: "Spring 2026" },
      { user: userId, subject: "Data Structures", credits: 4, grade: "A", semester: "Spring 2026" },
      { user: userId, subject: "Chemistry I", credits: 4, grade: "B", semester: "Spring 2026" },
      { user: userId, subject: "Business Fundamentals", credits: 3, grade: "A-", semester: "Spring 2026" },
    ]),
    Reminder.insertMany([
      { user: userId, title: "Submit Math Problem Set 5", date: "2026-07-08", time: "20:00", type: "assignment", done: false },
      { user: userId, title: "CS Neural Networks Presentation", date: "2026-07-09", time: "09:00", type: "exam", done: false },
      { user: userId, title: "Mathematics exam study session", date: "2026-07-10", time: "16:00", type: "study", done: false },
      { user: userId, title: "Group meeting — Climate project", date: "2026-07-11", time: "14:00", type: "event", done: false },
      { user: userId, title: "Literature reading chapters 8–10", date: "2026-07-07", time: "18:00", type: "assignment", done: true },
    ]),
    TimetableSlot.insertMany([
      { user: userId, day: "Monday", time: "09:00", end: "10:30", subject: "Mathematics", room: "Room 201", type: "Lecture" },
      { user: userId, day: "Monday", time: "11:00", end: "12:00", subject: "Computer Science", room: "Lab 3", type: "Lab" },
      { user: userId, day: "Monday", time: "14:00", end: "15:30", subject: "Literature", room: "Room 105", type: "Seminar" },
      { user: userId, day: "Tuesday", time: "09:00", end: "10:30", subject: "Chemistry", room: "Lab 1", type: "Lab" },
      { user: userId, day: "Tuesday", time: "13:00", end: "14:30", subject: "Business Studies", room: "Room 310", type: "Lecture" },
      { user: userId, day: "Wednesday", time: "10:00", end: "11:30", subject: "Environmental Science", room: "Room 220", type: "Lecture" },
      { user: userId, day: "Wednesday", time: "12:00", end: "13:00", subject: "Mathematics", room: "Room 201", type: "Tutorial" },
      { user: userId, day: "Wednesday", time: "15:00", end: "16:30", subject: "Computer Science", room: "Room 402", type: "Lecture" },
      { user: userId, day: "Thursday", time: "09:00", end: "10:30", subject: "Business Studies", room: "Room 310", type: "Case Study" },
      { user: userId, day: "Thursday", time: "11:00", end: "12:30", subject: "Chemistry", room: "Room 115", type: "Lecture" },
      { user: userId, day: "Thursday", time: "14:00", end: "15:00", subject: "Literature", room: "Room 105", type: "Workshop" },
      { user: userId, day: "Friday", time: "09:00", end: "10:30", subject: "Mathematics", room: "Room 201", type: "Lecture" },
      { user: userId, day: "Friday", time: "11:00", end: "12:00", subject: "Environmental Science", room: "Lab 2", type: "Lab" },
      { user: userId, day: "Friday", time: "13:00", end: "14:00", subject: "Computer Science", room: "Room 402", type: "Tutorial" },
    ]),
  ]);

  res.json({ seeded: true });
});

export default router;
