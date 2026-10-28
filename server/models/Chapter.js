import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'India'
    },
    leadName: {
      type: String,
      default: ''
    },
    leadEmail: {
      type: String,
      default: ''
    },
    activeMembersCount: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Chapter', chapterSchema);
