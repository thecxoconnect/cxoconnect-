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
      default: ''
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
      default: ''
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

// String sanitization pre-save hook to prevent object casting errors
mentorSchema.pre('save', function (next) {
  if (typeof this.photoUrl !== 'string') this.photoUrl = '';
  if (typeof this.image !== 'string') this.image = '';
  if (typeof this.linkedinUrl !== 'string') this.linkedinUrl = '';
  if (typeof this.linkedin !== 'string') this.linkedin = '';
  if (typeof this.imageKitFileId !== 'string') this.imageKitFileId = '';
  if (typeof this.designation !== 'string') this.designation = 'C-Suite Advisor';
  if (typeof this.company !== 'string') this.company = 'Enterprise';
  if (typeof this.city !== 'string') this.city = 'Mumbai';
  if (typeof this.bio !== 'string') this.bio = '';

  if (this.photoUrl && !this.image) this.image = this.photoUrl;
  if (this.image && !this.photoUrl) this.photoUrl = this.image;
  if (this.linkedinUrl && !this.linkedin) this.linkedin = this.linkedinUrl;
  if (this.linkedin && !this.linkedinUrl) this.linkedinUrl = this.linkedin;
  next();
});

export const Mentor = mongoose.model('Mentor', mentorSchema);
export default Mentor;
