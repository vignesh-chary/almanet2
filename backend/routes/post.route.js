import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/auth.middleware.js";
import contentModeration from "../middleware/contentModeration.middleware.js";
import {
	createPost,
	getFeedPosts,
	deletePost,
	getPostById,
	createComment,
	likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 50 * 1024 * 1024 // 50MB limit
	},
	fileFilter: (req, file, cb) => {
		// Accept images, videos, and PDFs
		if (file.mimetype.startsWith('image/') || 
			file.mimetype.startsWith('video/') || 
			file.mimetype === 'application/pdf' ||
			file.originalname.toLowerCase().endsWith('.pdf')) {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'), false);
		}
	}
});

router.get("/", protectRoute, getFeedPosts);
router.post("/create", protectRoute, upload.single('image'), contentModeration, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/comment", protectRoute, createComment);
router.post("/:id/like", protectRoute, likePost);

export default router;
