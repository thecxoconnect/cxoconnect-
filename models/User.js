import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid work email address']
    },
    password: {
      type: String,
      default: null,
      select: false // Excluded by default in queries for security
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    position: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
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
    areasOfInterest: {
      type: [String],
      default: []
    },
    termsAccepted: {
      type: Boolean,
      default: false
    },

    // OAuth IDs
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

    // Statuses: pending | approved | accepted | declined | rejected | inactive
    status: {
      type: String,
      enum: ['pending', 'approved', 'accepted', 'declined', 'rejected', 'inactive'],
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

    // OTP Fields
    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },

    // Account Activation & Password Recovery
    activationToken: {
      type: String,
      default: null
    },
    activationExpires: {
      type: Date,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },

    // Timestamps for audit
    appliedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.otp;
        delete ret.otpExpires;
        delete ret.activationToken;
        delete ret.activationExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.otp;
        delete ret.otpExpires;
        delete ret.activationToken;
        delete ret.activationExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Sync designation and position fields automatically
userSchema.pre('save', async function () {
  if (this.designation && !this.position) {
    this.position = this.designation;
  } else if (this.position && !this.designation) {
    this.designation = this.position;
  }

  // Hash password if modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to get sanitized user object without sensitive auth fields
 */
userSchema.methods.toSafeJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.otp;
  delete userObj.otpExpires;
  delete userObj.activationToken;
  delete userObj.activationExpires;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  delete userObj.__v;
  return userObj;
};

const User = mongoose.model('User', userSchema);

export default User;
