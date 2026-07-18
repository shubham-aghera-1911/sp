import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    examTime: String,
    duration: Number, // in minutes
    location: String,
    examType: {
      type: String,
      enum: ['Midterm', 'Final', 'Quiz', 'Practical', 'Other'],
      default: 'Final',
    },
    syllabus: String,
    marks: Number,
    maxMarks: Number,
    result: Number,
    preparedTopics: [String],
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
