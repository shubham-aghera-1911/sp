import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    dueDate: { type: String, required: true },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    type: { type: String, default: "Homework" },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
