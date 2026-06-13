import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token for a given user ID
 * @param {string} id - The user's MongoDB ID
 * @returns {string} - Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

export default generateToken;