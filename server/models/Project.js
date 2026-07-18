import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['Lead', 'Member'],
          default: 'Member',
        },
      },
    ],
    subject: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Review', 'Completed'],
      default: 'Planning',
    },
    tasks: [
      {
        taskId: mongoose.Schema.Types.ObjectId,
        title: String,
        assignedTo: mongoose.Schema.Types.ObjectId,
        status: String,
      },
    ],
    files: [String],
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
