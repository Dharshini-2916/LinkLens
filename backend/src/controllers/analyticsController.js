import Link from '../models/Link.js';
import Click from '../models/Click.js';
import mongoose from 'mongoose';

/**
 * @desc    Get detailed analytics for a specific link
 * @route   GET /api/analytics/:linkId
 * @access  Private
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { linkId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID' });
    }

    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Ensure user owns this link
    if (link.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this analytics' });
    }

    // 1. Calculate Health Score
    const healthScore = Link.calculateHealthScore(link);

    // 2. Get Daily Click Trends (last 30 days)
    const trends = await Click.getDailyTrends(linkId, 30);

    // 3. Get Recent Visits (last 10)
    const recentVisits = await Click.getRecentVisits(linkId, 10);

    // 4. Device & Browser Breakdown
    const deviceBreakdown = await Click.aggregate([
      { $match: { link: new mongoose.Types.ObjectId(linkId) } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const browserBreakdown = await Click.aggregate([
      { $match: { link: new mongoose.Types.ObjectId(linkId) } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 5. Geographic & Referrer Breakdown
    const countryBreakdown = await Click.aggregate([
      { $match: { link: new mongoose.Types.ObjectId(linkId) } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const referrerBreakdown = await Click.aggregate([
      { $match: { link: new mongoose.Types.ObjectId(linkId) } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        link: {
          ...link.toObject(),
          healthScore,
        },
        trends,
        recentVisits,
        deviceBreakdown,
        browserBreakdown,
        countryBreakdown,
        referrerBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate analytics for all user's links
 * @route   GET /api/analytics
 * @access  Private
 */
export const getOverallAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get all links of the user
    const links = await Link.find({ user: userId });
    const linkIds = links.map(l => l._id);

    // If no links, return empty stats
    if (links.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalLinks: 0,
          totalClicks: 0,
          trends: [],
          deviceBreakdown: [],
          browserBreakdown: [],
          countryBreakdown: [],
          referrerBreakdown: [],
          recentVisits: []
        }
      });
    }

    const totalClicks = links.reduce((sum, l) => sum + l.clickCount, 0);

    // 2. Click trends (last 30 days) across all user links
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const trends = await Click.aggregate([
      {
        $match: {
          link: { $in: linkIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          clicks: 1
        }
      }
    ]);

    // 3. Device breakdown across all user links
    const deviceBreakdown = await Click.aggregate([
      { $match: { link: { $in: linkIds } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Browser breakdown across all user links
    const browserBreakdown = await Click.aggregate([
      { $match: { link: { $in: linkIds } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Country breakdown across all user links
    const countryBreakdown = await Click.aggregate([
      { $match: { link: { $in: linkIds } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 6. Referrer breakdown across all user links
    const referrerBreakdown = await Click.aggregate([
      { $match: { link: { $in: linkIds } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 7. Recent visits (last 10)
    const recentVisits = await Click.find({ link: { $in: linkIds } })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('link', 'shortCode customAlias')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalLinks: links.length,
        totalClicks,
        trends,
        deviceBreakdown,
        browserBreakdown,
        countryBreakdown,
        referrerBreakdown,
        recentVisits
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public analytics for a specific link by shortCode
 * @route   GET /api/analytics/public/:shortCode
 * @access  Public
 */
export const getPublicAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Find link by shortCode or customAlias
    const link = await Link.findOne({
      $or: [{ shortCode }, { customAlias: shortCode.toLowerCase() }]
    });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Check if public stats page is enabled for this link
    if (link.isPublicStats === false) {
      return res.status(403).json({ success: false, message: 'Public stats are disabled for this link' });
    }

    const healthScore = Link.calculateHealthScore(link);
    const trends = await Click.getDailyTrends(link._id, 30);

    const deviceBreakdown = await Click.aggregate([
      { $match: { link: link._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const browserBreakdown = await Click.aggregate([
      { $match: { link: link._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const countryBreakdown = await Click.aggregate([
      { $match: { link: link._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const referrerBreakdown = await Click.aggregate([
      { $match: { link: link._id } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Return public-safe recent visits (no IP addresses)
    const recentVisits = await Click.find({ link: link._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('timestamp country city browser os device referrer')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        link: {
          originalUrl: link.originalUrl,
          shortCode: link.shortCode,
          customAlias: link.customAlias,
          createdAt: link.createdAt,
          clickCount: link.clickCount,
          lastVisited: link.lastVisited,
          status: link.status,
          expiryDate: link.expiryDate,
          healthScore
        },
        trends,
        recentVisits,
        deviceBreakdown,
        browserBreakdown,
        countryBreakdown,
        referrerBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};