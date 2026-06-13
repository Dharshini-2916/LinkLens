import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema(
  {
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: [true, 'Click must belong to a link'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Click must belong to a user'],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
    // Geolocation data
    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    region: {
      type: String,
      default: null,
    },
    // Device/Browser data
    browser: {
      type: String,
      default: null,
    },
    os: {
      type: String,
      default: null,
    },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics queries
clickSchema.index({ link: 1, timestamp: -1 });
clickSchema.index({ user: 1, timestamp: -1 });
clickSchema.index({ link: 1, country: 1 });
clickSchema.index({ link: 1, device: 1 });

// Static method to get click statistics for a link
clickSchema.statics.getLinkStats = async function (linkId) {
  const stats = await this.aggregate([
    {
      $match: { link: new mongoose.Types.ObjectId(linkId) },
    },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: 1 },
        lastClicked: { $max: '$timestamp' },
        uniqueIPs: { $addToSet: '$ipAddress' },
        countries: { $addToSet: '$country' },
        devices: { $addToSet: '$device' },
      },
    },
    {
      $project: {
        _id: 0,
        totalClicks: 1,
        lastClicked: 1,
        uniqueVisitors: { $size: '$uniqueIPs' },
        countryCount: { $size: '$countries' },
        deviceCount: { $size: '$devices' },
      },
    },
  ]);

  return stats[0] || {
    totalClicks: 0,
    lastClicked: null,
    uniqueVisitors: 0,
    countryCount: 0,
    deviceCount: 0,
  };
};

// Static method to get daily click trends
clickSchema.statics.getDailyTrends = async function (linkId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await this.aggregate([
    {
      $match: {
        link: new mongoose.Types.ObjectId(linkId),
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
        },
        clicks: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        clicks: 1,
      },
    },
  ]);

  return trends;
};

// Static method to get recent visits
clickSchema.statics.getRecentVisits = async function (linkId, limit = 10) {
  return await this.find({ link: linkId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('timestamp ipAddress country city browser os device referrer')
    .lean();
};

const Click = mongoose.model('Click', clickSchema);

export default Click;