import { Router } from 'express';
import QRCode from 'qrcode';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import { CXO_NAVBAR_ITEMS, OCT_30_EVENT, getSuperAdminEmails } from '../config/constants.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Expose CXO Network Navigation
router.get('/navbar', (req, res) => {
  res.json({
    success: true,
    navbar: CXO_NAVBAR_ITEMS
  });
});

// Expose 30 October Event Information
router.get('/event', (req, res) => {
  res.json({
    success: true,
    event: OCT_30_EVENT
  });
});

// Generate High-Resolution Event Standee QR Code for Mobile Login Journey
router.get('/qr', async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || `http://${req.headers.host || 'localhost:5000'}`;
    const targetUrl = `${clientUrl}/#login?source=standee_qr&event=oct30`;

    // Generate base64 Data URI QR Code
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      targetUrl,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'QR generation failed', error: err.message });
  }
});

// System Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ONLINE',
    service: 'The CXO Network Backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    superAdminsCount: getSuperAdminEmails().length,
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
