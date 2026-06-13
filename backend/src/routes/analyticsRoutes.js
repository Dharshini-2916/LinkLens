import express from 'express';
import { getAnalytics, getOverallAnalytics, getPublicAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for public stats page
// @route   GET /api/analytics/public/:shortCode
router.get('/public/:shortCode', getPublicAnalytics);

// Protected routes require authentication
router.use(protect);

// @route   GET /api/analytics
router.get('/', getOverallAnalytics);

// @route   GET /api/analytics/:linkId
router.get('/:linkId', getAnalytics);

export default router;