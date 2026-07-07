import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    attended: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    color: { type: String, default: "#7c3aed" },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, subject: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
