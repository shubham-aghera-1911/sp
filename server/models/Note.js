import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
    },
    subject: String,
    category: {
      type: String,
      enum: ['Lecture', 'Study', 'Reference', 'Personal', 'Other'],
      default: 'Study',
    },
    tags: [String],
    color: {
      type: String,
      default: '#FFE8E4',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
