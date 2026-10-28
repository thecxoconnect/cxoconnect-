import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: true,
      trim: true
    },
    authorRole: {
      type: String,
      default: 'C-Suite Executive'
    },
    company: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
    },
    imageKitFileId: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Testimonial', testimonialSchema);
