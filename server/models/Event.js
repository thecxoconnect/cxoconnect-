import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    speakerMentor: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: 'Mumbai, India'
    },
    eventDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    date: {
      type: String,
      default: function () {
        return this.eventDate ? this.eventDate.toDateString() : 'November 24, 2026';
      }
    },
    time: {
      type: String,
      default: '09:30 AM - 04:30 PM IST'
    },
    venue: {
      type: String,
      default: 'The Taj Mahal Palace'
    },
    type: {
      type: String,
      enum: ['UPCOMING', 'PAST', 'upcoming', 'completed', 'cancelled'],
      default: 'UPCOMING'
    },
    category: {
      type: String,
      default: 'Leadership Summit'
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80'
    },
    imageKitFileId: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: function () {
        return this.bannerUrl;
      }
    },
    rsvps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
      enum: ['upcoming', 'completed', 'cancelled', 'UPCOMING', 'PAST'],
      default: 'upcoming'
    }
  },
  { timestamps: true }
);

eventSchema.pre('save', function (next) {
  if (this.bannerUrl && !this.banner) this.banner = this.bannerUrl;
  if (this.banner && !this.bannerUrl) this.bannerUrl = this.banner;
  if (this.rsvps && this.rsvps.length > 0 && (!this.attendees || this.attendees.length === 0)) {
    this.attendees = this.rsvps;
  }
  if (this.attendees && this.attendees.length > 0 && (!this.rsvps || this.rsvps.length === 0)) {
    this.rsvps = this.attendees;
  }
  next();
});

export default mongoose.model('Event', eventSchema);
