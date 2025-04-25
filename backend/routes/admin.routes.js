import express from 'express';
import {
    getAllEvents,
    updateEvent,
    deleteEvent,
    getEventParticipants
} from '../controllers/admin/event.controller.js';
import {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateUserDetails,
    getUserDetails,
    getAnalytics
} from '../controllers/admin/admin.controller.js';
import {
    getAllPosts,
    deletePost,
    updatePostStatus
} from '../controllers/admin/post.controller.js';
import { protectRoute, authorize } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// All routes protected and require admin role
router.use(protectRoute);
router.use(authorize('admin'));

// Admin dashboard routes
router.get('/stats', getAdminStats);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'bannerImg', maxCount: 1 }
]), updateUserDetails);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Post management routes
router.get('/posts', getAllPosts);
router.delete('/posts/:postId', deletePost);
router.put('/posts/:postId/status', updatePostStatus);

// Event management routes
router.get('/events', getAllEvents);
router.put('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);
router.get('/events/:eventId/participants', getEventParticipants);

export default router;