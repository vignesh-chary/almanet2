import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { registerForEvent,getEventDetails,getEvents } from "../controllers/event.controller.js";

const router = express.Router();

router.get('/', protectRoute,getEvents);
router.get('/:eventId',protectRoute, getEventDetails); 
router.post("/:eventId/register", protectRoute, registerForEvent);
export default router;