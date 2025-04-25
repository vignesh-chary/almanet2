import express from 'express';
import { moderateContent, getModeratedContent, updateUserModerationPreferences } from '../controllers/moderationController.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import contentModerationMiddleware from '../middleware/contentModeration.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// Test route for content moderation
router.post('/test-moderation', contentModerationMiddleware, (req, res) => {
    res.json({
        success: true,
        message: 'Content passed moderation check',
        content: req.body.content
    });
});

// Apply content moderation middleware to content creation routes
router.post('/posts/:postId/moderate', moderateContent);
router.post('/posts/:postId/comments/:commentId/moderate', moderateContent);
router.get('/moderated-content', getModeratedContent);
router.put('/preferences', updateUserModerationPreferences);

export default router; 