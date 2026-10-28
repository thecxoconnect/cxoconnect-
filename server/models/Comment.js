import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorPosition: {
      type: String,
      default: 'Executive Member'
    },
    authorCompany: {
      type: String,
      default: ''
    },
    authorImage: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
