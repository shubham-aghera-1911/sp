import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    subject: String,
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Submitted', 'Graded'],
      default: 'Pending',
    },
    marks: Number,
    maxMarks: Number,
    attachments: [String],
    submissionDate: Date,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
