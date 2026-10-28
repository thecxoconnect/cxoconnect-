import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      default: '09:30 AM - 04:30 PM IST'
    },
    venue: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: 'Mumbai, India'
    },
    category: {
      type: String,
      enum: ['Leadership Summit', 'C-Suite Roundtable', 'Executive Masterclass', 'Networking Conclave'],
      default: 'Leadership Summit'
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80'
    },
    speakers: [
      {
        name: String,
        position: String,
        company: String,
        image: String
      }
    ],
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
