import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getSuggestedConnections, 
    getPublicProfile, 
    updateProfile, 
    searchUsers,
    recordInteraction,
    getUserStats,
    getProfilePicture
} from "../controllers/user.controller.js";

const router = express.Router();

// router.get("/recommendations", protectRoute, getRecommendations);
router.get("/search", protectRoute, searchUsers);
router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile);
router.put("/profile", protectRoute, updateProfile);

// New routes for stats and interactions
router.post("/interactions", protectRoute, recordInteraction);
router.get("/stats/:userId?", protectRoute, getUserStats);

// Profile picture route
router.get("/profile-picture/:username", protectRoute, getProfilePicture);

export default router;
