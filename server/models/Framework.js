import mongoose from 'mongoose';

const frameworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Technology Strategy'
    },
    author: {
      type: String,
      default: 'CXO Advisory Council'
    },
    readTime: {
      type: String,
      default: '15 min read'
    },
    summary: {
      type: String,
      required: true
    },
    downloadUrl: {
      type: String,
      default: '#'
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Framework', frameworkSchema);
