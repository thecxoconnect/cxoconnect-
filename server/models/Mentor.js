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
      default: 'C-Suite Advisor'
    },
    company: {
      type: String,
      default: 'Enterprise'
    },
    city: {
      type: String,
      default: 'Mumbai'
    },
    linkedinUrl: {
      type: String,
      default: ''
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'
    },
    imageKitFileId: {
      type: String,
      default: ''
    },
    expertise: {
      type: [String],
      default: ['Strategic Governance', 'Enterprise Scaling']
    },
    bio: {
      type: String,
      default: ''
    },
    // Backwards compatibility aliases
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
    availableForMentorship: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Sync photoUrl with image
mentorSchema.pre('save', function (next) {
  if (this.photoUrl && !this.image) this.image = this.photoUrl;
  if (this.image && !this.photoUrl) this.photoUrl = this.image;
  if (this.linkedinUrl && !this.linkedin) this.linkedin = this.linkedinUrl;
  if (this.linkedin && !this.linkedinUrl) this.linkedinUrl = this.linkedin;
  next();
});

export default mongoose.model('Mentor', mentorSchema);
