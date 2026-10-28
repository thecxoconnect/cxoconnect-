import express from 'express';
import authRoutes from './authRoutes.js';
import memberRoutes from './memberRoutes.js';
import eventRoutes from './eventRoutes.js';
import commentRoutes from './commentRoutes.js';
import committeeRoutes from './committeeRoutes.js';
import mentorRoutes from './mentorRoutes.js';
import sponsorRoutes from './sponsorRoutes.js';
import quizRoutes from './quizRoutes.js';
import contactRoutes from './contactRoutes.js';
import imagekitRoutes from './imagekitRoutes.js';
import chapterRoutes from './chapterRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Mount all API domain routes
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/events', eventRoutes);
router.use('/comments', commentRoutes);
router.use('/committee', committeeRoutes);
router.use('/mentors', mentorRoutes);
router.use('/sponsors', sponsorRoutes);
router.use('/partners', sponsorRoutes); // Alias
router.use('/quiz', quizRoutes);
router.use('/contact', contactRoutes);
router.use('/imagekit', imagekitRoutes);
router.use('/chapters', chapterRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'CXO Connect REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
