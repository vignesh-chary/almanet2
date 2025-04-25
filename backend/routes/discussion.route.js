import express from "express";
import {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  addAnswer,
  voteDiscussion,
  voteAnswer,
  markAsSolved,
} from "../controllers/discussion.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getDiscussions);
router.get("/:id", getDiscussion);
router.post("/", upload.single("file"), createDiscussion);
router.post("/:id/answers", upload.single("file"), addAnswer);
router.post("/:id/vote", protect, voteDiscussion);
router.post("/:discussionId/answers/:answerId/vote", protect, voteAnswer);
router.patch("/:id/solve", protect, markAsSolved);

export default router; 