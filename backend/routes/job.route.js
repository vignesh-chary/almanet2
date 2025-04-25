import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  applyForJob,
  deleteJob,
  editJob,
  getAlumniJobs,
  updateApplicationStatus,
  getAppliedJobs,
  getJobApplicants,
  getJobRecommendations
} from "../controllers/job.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { alumniRoute } from "../middleware/alumni.middleware.js";

const router = express.Router();

// Alumni-specific routes
router.get('/my-jobs', protectRoute, alumniRoute, getAlumniJobs);

// General job routes
router.post('/', protectRoute, alumniRoute, createJob);
router.get('/', protectRoute, getAllJobs);
router.get('/recommendations', protectRoute, getJobRecommendations);

// Applied jobs route (should be before /:jobId)
router.get("/applied", protectRoute, getAppliedJobs);

// Job-specific routes
router.get('/:jobId', protectRoute, getJobById);
router.post('/:jobId/apply', protectRoute, applyForJob);
router.delete('/:jobId', protectRoute, alumniRoute, deleteJob);
router.put('/:jobId', protectRoute, alumniRoute, editJob);
router.post("/:jobId/applicants/:applicantEmail", protectRoute, alumniRoute, updateApplicationStatus);
router.get('/:jobId/applicants', protectRoute, alumniRoute, getJobApplicants);

export default router;