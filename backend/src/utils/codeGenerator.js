import { nanoid } from 'nanoid';

/**
 * Generate a unique short code
 * @param {number} length - Length of the short code (default: 7)
 * @returns {string} - Unique short code
 */
export const generateShortCode = (length = 7) => {
  return nanoid(length);
};