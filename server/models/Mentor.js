import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema(
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
    expertise: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'
    },
    linkedin: {
      type: String,
      default: ''
    },
    availableForMentorship: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Mentor', mentorSchema);
