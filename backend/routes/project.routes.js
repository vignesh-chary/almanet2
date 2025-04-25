import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  addTask,
  updateTaskStatus,
  sendMessage,
  uploadFile,
  deleteFile
} from '../controllers/project.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(protectRoute);

// Project CRUD routes
router.post('/', createProject);
router.get('/:id', getProject);
router.get('/', getProjects);

router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Team member routes
router.post('/:id/team', addTeamMember);
router.delete('/:id/team/:userId', removeTeamMember);

// Task routes
router.post('/:id/tasks', addTask);
router.put('/:id/tasks/:taskId/status', updateTaskStatus);

// Message routes
router.post('/:id/messages', upload.single('file'), sendMessage);

// File routes
router.post('/:id/files', upload.single('file'), uploadFile);
router.delete('/:id/files/:fileId', deleteFile);

export default router; 