import express from 'express';
import { getFrameworks, getCertifications } from '../controllers/resourceController.js';

const router = express.Router();

router.get('/frameworks', getFrameworks);
router.get('/certifications', getCertifications);

export default router;
