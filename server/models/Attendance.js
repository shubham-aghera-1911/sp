import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave'],
      required: true,
    },
    notes: String,
  },
  { timestamps: true }
);

// Index for efficient queries
attendanceSchema.index({ userId: 1, subject: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
