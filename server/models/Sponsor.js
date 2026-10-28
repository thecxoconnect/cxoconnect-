import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    tier: {
      type: String,
      enum: ['Strategic Partner', 'Platinum Sponsor', 'Gold Sponsor', 'Silver Sponsor', 'Knowledge Partner'],
      default: 'Gold Sponsor'
    },
    logo: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    description: {
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

export default mongoose.model('Sponsor', sponsorSchema);
