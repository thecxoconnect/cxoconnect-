import crypto from 'crypto';

/**
 * Generates a secure 6-digit numeric OTP string
 * @returns {string} 6-digit OTP (e.g., '582914')
 */
export const generateOtp = () => {
  // Use crypto for cryptographically secure random number between 100000 and 999999
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
};
