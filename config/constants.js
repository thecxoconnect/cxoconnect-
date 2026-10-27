/**
 * Application Constants for The CXO Network
 */

// Super Admin Emails (hardcoded defaults merged with environment variable)
const DEFAULT_SUPER_ADMINS = [
  'theanvisharma@gmail.com',
  'admin@myhrsg.org',
  'superadmin@cxoconnect.com'
];

export const getSuperAdminEmails = () => {
  const envAdmins = process.env.SUPER_ADMIN_EMAILS
    ? process.env.SUPER_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
    : [];
  return Array.from(new Set([...DEFAULT_SUPER_ADMINS.map((e) => e.toLowerCase()), ...envAdmins]));
};

export const isSuperAdminEmail = (email) => {
  if (!email) return false;
  const adminList = getSuperAdminEmails();
  return adminList.includes(email.trim().toLowerCase());
};

// Website Navigation (Requested: Home | About | Member Benefits | Engagements | Member Login)
export const CXO_NAVBAR_ITEMS = [
  { label: 'Home', url: '#home', path: '/' },
  { label: 'About', url: '#about', path: '/#about' },
  { label: 'Member Benefits', url: '#benefits', path: '/#benefits' },
  { label: 'Engagements', url: '#engagements', path: '/#engagements' },
  { label: 'Member Login', url: '#login', path: '/login', isLogin: true }
];

export const USER_ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin'
};

export const USER_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  REJECTED: 'rejected',
  INACTIVE: 'inactive'
};

export const JWT_CONFIG = {
  VERIFICATION_EXPIRY: '15m',
  SESSION_EXPIRY: '30d'
};

export const OTP_CONFIG = {
  EXPIRY_MINUTES: 10,
  LENGTH: 6
};

// Event Details for 30 October 2026
export const OCT_30_EVENT = {
  title: 'The CXO Network Annual Leadership Conclave',
  date: 'Wednesday, 30 October 2026',
  time: '09:30 AM – 04:30 PM IST',
  venue: 'The Grand Ballroom & Terrace, The St. Regis',
  location: 'Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
  theme: 'Navigating Disruption: Leadership, Technology & Collaborative Governance',
  agenda: [
    { time: '09:30 AM – 10:15 AM', session: 'Registration, Morning Networking & Executive Breakfast' },
    { time: '10:15 AM – 11:00 AM', session: 'Opening Keynote: Reimagining Enterprise Resilience in 2027 and Beyond' },
    { time: '11:15 AM – 12:45 PM', session: 'Curated Roundtables: AI Transformation, Talent Paradigms & Board Governance' },
    { time: '01:00 PM – 02:15 PM', session: 'Executive Networking Luncheon & Fireside Dialogue' },
    { time: '02:30 PM – 03:45 PM', session: 'Collaborative Exchange: Cross-Industry Partnerships & Scale' },
    { time: '03:45 PM – 04:30 PM', session: 'Closing Perspectives, Member Accreditations & High Tea' }
  ]
};
