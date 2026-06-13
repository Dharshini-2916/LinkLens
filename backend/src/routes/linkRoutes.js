import express from 'express';
import { body } from 'express-validator';
import { createLink, getLinks, getLinkById, deleteLink, updateLink, bulkCreateLinks } from '../controllers/linkController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// @route   POST /api/links
router.post(
  '/',
  [
    body('originalUrl').isURL().withMessage('Please provide a valid URL'),
    body('customAlias')
      .optional({ checkFalsy: true })
      .matches(/^[a-zA-Z0-9_-]*$/)
      .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores')
      .isLength({ max: 30 })
      .withMessage('Custom alias must be 30 characters or less'),
    body('expiryDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid date'),
  ],
  validate,
  createLink
);

// @route   POST /api/links/bulk
router.post(
  '/bulk',
  [
    body('links').isArray().withMessage('links must be an array'),
  ],
  validate,
  bulkCreateLinks
);

// @route   GET /api/links
router.get('/', getLinks);

// @route   GET /api/links/:id
router.get('/:id', getLinkById);

// @route   PUT /api/links/:id
router.put(
  '/:id',
  [
    body('originalUrl').optional().isURL().withMessage('Please provide a valid URL'),
    body('customAlias')
      .optional({ checkFalsy: true })
      .matches(/^[a-zA-Z0-9_-]*$/)
      .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores')
      .isLength({ max: 30 })
      .withMessage('Custom alias must be 30 characters or less'),
    body('expiryDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid date'),
    body('isEnabled').optional().isBoolean().withMessage('isEnabled must be a boolean'),
    body('isPublicStats').optional().isBoolean().withMessage('isPublicStats must be a boolean'),
  ],
  validate,
  updateLink
);

// @route   DELETE /api/links/:id
router.delete('/:id', deleteLink);

export default router;