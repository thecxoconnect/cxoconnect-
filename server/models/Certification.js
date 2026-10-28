import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      default: 'CXO Connect Governance Academy'
    },
    duration: {
      type: String,
      default: '6 Weeks'
    },
    level: {
      type: String,
      default: 'Executive Leadership Track'
    },
    modules: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Certification', certificationSchema);
