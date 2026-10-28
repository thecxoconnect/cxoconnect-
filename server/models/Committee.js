import mongoose from 'mongoose';

const committeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Advisory Board', 'Executive Committee', 'Regional Chapter Leads'],
      default: 'Executive Committee'
    },
    bio: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
    },
    linkedin: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Committee', committeeSchema);
