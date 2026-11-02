import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'CXO Connect REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.get('/oauth', (req, res) => {
  const config = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Configured' : '❌ Missing',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '❌ Missing',
    CLIENT_URL: process.env.CLIENT_URL || '❌ Missing',
    MONGO_URI: process.env.MONGO_URI ? '✅ Configured' : '❌ Missing',
    EMAIL_USER: process.env.EMAIL_USER || '❌ Missing',
    EMAIL_PASS: process.env.EMAIL_PASS ? '✅ Configured' : '❌ Missing'
  };

  const missingKeys = Object.keys(config).filter(key => config[key] === '❌ Missing' || config[key].includes('Missing'));
  
  res.json({
    status: missingKeys.length === 0 ? 'HEALTHY' : 'NEEDS_VERCEL_UPDATE',
    diagnostic: config,
    action_required: missingKeys.length > 0 
      ? `Add the following environment variables to Vercel (Project: cxoconnect-2bui): ${missingKeys.join(', ')}`
      : 'All required backend environment variables are correctly loaded.'
  });
});

export default router;

