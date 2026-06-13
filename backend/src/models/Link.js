import mongoose from 'mongoose';
import validator from 'validator';

const linkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Link must belong to a user'],
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Please provide the original URL'],
      validate: {
        validator: function (value) {
          return validator.isURL(value, {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: ['http', 'https'],
          });
        },
        message: 'Please provide a valid URL (must start with http:// or https://)',
      },
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      maxlength: [20, 'Short code cannot exceed 20 characters'],
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      trim: true,
      lowercase: true,
      maxlength: [30, 'Custom alias cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_-]*$/, 'Custom alias can only contain letters, numbers, hyphens, and underscores'],
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Expired', 'Disabled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // Expiry date must be in the future (or null for never expire)
          if (!value) return true;
          return value > new Date();
        },
        message: 'Expiry date must be in the future',
      },
    },
    lastVisited: {
      type: Date,
      default: null,
    },
    qrCodeUrl: {
      type: String,
      default: null,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    isPublicStats: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient queries
linkSchema.index({ user: 1, createdAt: -1 });
linkSchema.index({ user: 1, status: 1 });
linkSchema.index({ shortCode: 1, customAlias: 1 });

// Virtual for full short URL
linkSchema.virtual('shortUrl').get(function () {
  const baseUrl = process.env.SHORT_URL_BASE || 'http://localhost:5000';
  const code = this.customAlias || this.shortCode;
  return `${baseUrl}/${code}`;
});

// Virtual for link age in days
linkSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if link is expired
linkSchema.methods.isExpired = function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

// Method to check if link is active
linkSchema.methods.isActive = function () {
  return this.isEnabled && this.status === 'Active' && !this.isExpired();
};

// Pre-save middleware to update status based on expiry
linkSchema.pre('save', function (next) {
  if (this.isExpired() && this.status === 'Active') {
    this.status = 'Expired';
  }
  next();
});

// Static method to calculate health score
linkSchema.statics.calculateHealthScore = function (link) {
  let score = 0;
  const now = new Date();
  const ageInDays = Math.ceil((now - link.createdAt) / (1000 * 60 * 60 * 24));

  // Click activity (max 40 points)
  if (link.clickCount >= 100) score += 40;
  else if (link.clickCount >= 50) score += 30;
  else if (link.clickCount >= 20) score += 20;
  else if (link.clickCount >= 5) score += 10;

  // Link age (max 20 points)
  if (ageInDays <= 7) score += 20;
  else if (ageInDays <= 30) score += 15;
  else if (ageInDays <= 90) score += 10;
  else score += 5;

  // Status (max 20 points)
  if (link.status === 'Active') score += 20;
  else if (link.status === 'Expired') score += 5;

  // Recent activity (max 20 points)
  if (link.lastVisited) {
    const daysSinceLastVisit = Math.ceil((now - link.lastVisited) / (1000 * 60 * 60 * 24));
    if (daysSinceLastVisit <= 1) score += 20;
    else if (daysSinceLastVisit <= 7) score += 15;
    else if (daysSinceLastVisit <= 30) score += 10;
    else score += 5;
  }

  // Determine rating
  let rating = 'Poor';
  if (score >= 80) rating = 'Excellent';
  else if (score >= 60) rating = 'Good';
  else if (score >= 40) rating = 'Average';

  return { score, rating };
};

const Link = mongoose.model('Link', linkSchema);

export default Link;