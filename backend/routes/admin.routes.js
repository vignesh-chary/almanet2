import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminRoute } from "../middleware/admin.middleware.js";
import { getAdminStats, getAllUsers,createEvent,getAllEvents,updateEvent,deleteEvent,getEventRSVPs,uploadEventImages } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", protectRoute, adminRoute, getAdminStats);
router.get("/users", protectRoute, adminRoute, getAllUsers);
router.post("/events", protectRoute, adminRoute, createEvent);
router.get("/events", protectRoute, adminRoute, getAllEvents);
router.put("/events/:eventId", protectRoute, adminRoute, updateEvent);
router.delete("/events/:eventId", protectRoute, adminRoute, deleteEvent);
router.get("/events/:eventId/rsvps", protectRoute, adminRoute, getEventRSVPs);
router.post("/events/:eventId/upload-images", protectRoute, adminRoute, uploadEventImages);

export default router;
