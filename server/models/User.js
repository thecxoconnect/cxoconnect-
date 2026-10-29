import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Corporate or personal email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    linkedinId: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    position: {
      type: String,
      trim: true,
      default: ''
    },
    linkedin: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },

    // Roles: member | admin
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    isMainAdmin: {
      type: Boolean,
      default: false
    },

    // Statuses: pending | accepted | rejected
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    profileComplete: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    // OTP Verification Fields
    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.otp;
        delete ret.otpExpires;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.otp;
        delete ret.otpExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.methods.toSafeJSON = function () {
  const userObj = this.toObject();
  delete userObj.otp;
  delete userObj.otpExpires;
  delete userObj.__v;
  return userObj;
};
const User = mongoose.model('User', userSchema);
export { User };
export default User;
