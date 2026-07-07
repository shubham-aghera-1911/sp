import mongoose from "mongoose";

const timetableSlotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    time: { type: String, required: true },
    end: { type: String, required: true },
    subject: { type: String, required: true },
    room: { type: String, default: "" },
    type: { type: String, default: "Lecture" },
  },
  { timestamps: true }
);

export default mongoose.model("TimetableSlot", timetableSlotSchema);
