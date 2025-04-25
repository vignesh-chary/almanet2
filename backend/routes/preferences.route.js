import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getThemePreference, updateThemePreference } from '../controllers/preferences.controller.js';

const router = express.Router();

// Theme preference routes
router.get('/theme', protectRoute, getThemePreference);
router.post('/theme', protectRoute, updateThemePreference);

export default router;