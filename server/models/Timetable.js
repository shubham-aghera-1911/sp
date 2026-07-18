import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    startTime: {
      type: String, // Format: HH:MM
      required: true,
    },
    endTime: {
      type: String, // Format: HH:MM
      required: true,
    },
    classroom: String,
    instructor: String,
    semester: Number,
    color: String,
  },
  { timestamps: true }
);

// Index for efficient queries
timetableSchema.index({ userId: 1, dayOfWeek: 1 });

export default mongoose.model('Timetable', timetableSchema);
