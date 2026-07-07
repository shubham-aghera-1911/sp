import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { protect } from "./middleware/auth.js";

import authRoutes from "./routes/auth.js";
import assignmentRoutes from "./routes/assignments.js";
import examRoutes from "./routes/exams.js";
import attendanceRoutes from "./routes/attendance.js";
import noteRoutes from "./routes/notes.js";
import projectRoutes from "./routes/projects.js";
import gradeRoutes from "./routes/grades.js";
import reminderRoutes from "./routes/reminders.js";
import timetableRoutes from "./routes/timetable.js";
import timerRoutes from "./routes/timer.js";
import plannerRoutes from "./routes/planner.js";
import seedRoutes from "./routes/seed.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Public
app.use("/api/auth", authRoutes);

// Protected (everything below requires a valid JWT)
app.use("/api/assignments", protect, assignmentRoutes);
app.use("/api/exams", protect, examRoutes);
app.use("/api/attendance", protect, attendanceRoutes);
app.use("/api/notes", protect, noteRoutes);
app.use("/api/projects", protect, projectRoutes);
app.use("/api/grades", protect, gradeRoutes);
app.use("/api/reminders", protect, reminderRoutes);
app.use("/api/timetable", protect, timetableRoutes);
app.use("/api/timer", protect, timerRoutes);
app.use("/api/planner", protect, plannerRoutes);
app.use("/api/seed", protect, seedRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
