import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ["assignment", "exam", "event", "study"], default: "assignment" },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
