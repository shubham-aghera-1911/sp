import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Project.find({ user: req.userId }).sort({ deadline: 1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { name, subject, deadline, members, tasks } = req.body;
    if (!name || !subject || !deadline) {
      return res.status(400).json({ message: "name, subject and deadline are required" });
    }
    const item = await Project.create({
      user: req.userId,
      name,
      subject,
      deadline,
      members: members || [],
      tasks: tasks || [],
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await Project.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Project not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const item = await Project.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!item) return res.status(404).json({ message: "Project not found" });
  res.json({ message: "Deleted" });
});

// Add a task to a project
router.post("/:id/tasks", async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.userId });
  if (!project) return res.status(404).json({ message: "Project not found" });
  project.tasks.push({ title: req.body.title, assignee: req.body.assignee || "You" });
  await project.save();
  res.status(201).json(project);
});

// Toggle / update a task within a project
router.put("/:id/tasks/:taskId", async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.userId });
  if (!project) return res.status(404).json({ message: "Project not found" });
  const task = project.tasks.id(req.params.taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });
  Object.assign(task, req.body);
  await project.save();
  res.json(project);
});

// Remove a task from a project
router.delete("/:id/tasks/:taskId", async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.userId });
  if (!project) return res.status(404).json({ message: "Project not found" });
  project.tasks.id(req.params.taskId).deleteOne();
  await project.save();
  res.json(project);
});

export default router;
