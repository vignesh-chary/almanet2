import express from "express";
import { getRecommendedUsers,getRecommendedMentors } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.get("/:userId/recommendations", getRecommendedUsers);
router.get("/:userId/recommended-mentors", getRecommendedMentors);


export default router;