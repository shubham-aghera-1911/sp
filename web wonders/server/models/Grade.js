import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    credits: { type: Number, required: true },
    grade: { type: String, required: true },
    semester: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Grade", gradeSchema);
