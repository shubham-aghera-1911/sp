import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    room: { type: String, default: "" },
    color: { type: String, default: "#7c3aed" },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
