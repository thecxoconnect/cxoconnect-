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
      default: 'partner'
    },
    logoUrl: {
      type: String,
      default: ''
    },
    imageKitFileId: {
      type: String,
      default: ''
    },
    websiteUrl: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    // Compatibility fields
    logo: {
      type: String,
      default: function () {
        return this.logoUrl;
      }
    },
    website: {
      type: String,
      default: function () {
        return this.websiteUrl;
      }
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

sponsorSchema.pre('save', function (next) {
  if (this.logoUrl && !this.logo) this.logo = this.logoUrl;
  if (this.logo && !this.logoUrl) this.logoUrl = this.logo;
  if (this.websiteUrl && !this.website) this.website = this.websiteUrl;
  if (this.website && !this.websiteUrl) this.websiteUrl = this.website;
  next();
});

export default mongoose.model('Sponsor', sponsorSchema);
