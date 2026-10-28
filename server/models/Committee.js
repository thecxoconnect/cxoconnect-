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
      default: 'Board Member'
    },
    company: {
      type: String,
      default: 'Enterprise'
    },
    city: {
      type: String,
      default: 'Mumbai'
    },
    category: {
      type: String,
      enum: ['Advisory Board', 'Executive Committee', 'Regional Chapter Leads'],
      default: 'Executive Committee'
    },
    linkedinUrl: {
      type: String,
      default: ''
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
    },
    imageKitFileId: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    // Compatibility fields
    image: {
      type: String,
      default: function () {
        return this.photoUrl;
      }
    },
    linkedin: {
      type: String,
      default: function () {
        return this.linkedinUrl;
      }
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

committeeSchema.pre('save', function (next) {
  if (this.photoUrl && !this.image) this.image = this.photoUrl;
  if (this.image && !this.photoUrl) this.photoUrl = this.image;
  if (this.linkedinUrl && !this.linkedin) this.linkedin = this.linkedinUrl;
  if (this.linkedin && !this.linkedinUrl) this.linkedinUrl = this.linkedin;
  next();
});

export default mongoose.model('Committee', committeeSchema);
