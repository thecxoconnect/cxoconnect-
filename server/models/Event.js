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
      default: ''
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
      default: ''
    },
    imageKitFileId: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: ''
    },
    gallery: {
      type: [String],
      default: []
    },
    registrationUrl: {
      type: String,
      default: ''
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

// String sanitization pre-save hook
eventSchema.pre('save', function (next) {
  if (typeof this.bannerUrl !== 'string') this.bannerUrl = '';
  if (typeof this.banner !== 'string') this.banner = '';
  if (typeof this.imageKitFileId !== 'string') this.imageKitFileId = '';
  if (typeof this.speakerMentor !== 'string') this.speakerMentor = '';
  if (typeof this.location !== 'string') this.location = 'Mumbai, India';
  if (typeof this.venue !== 'string') this.venue = 'The Taj Mahal Palace';
  if (typeof this.time !== 'string') this.time = '09:30 AM - 04:30 PM IST';
  if (typeof this.category !== 'string') this.category = 'Leadership Summit';
  if (typeof this.registrationUrl !== 'string') this.registrationUrl = '';

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

export const Event = mongoose.model('Event', eventSchema);
export default Event;
