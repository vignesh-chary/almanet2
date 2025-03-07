import express from "express";
import {
  requestMentorship,
  registerMentorship,
  getMentorshipRequests,
  updateMentorshipStatus,
  getMentors,getMentorStatus,getMenteeCount,getRequestCount,getMentorshipRequestStatus,getAcceptedMentors,getGoals,addGoal,deleteGoal,getmentorshipId,
  addSubgoal,toggleSubgoal,deleteSubGoal,getUserRoleAndData,markGoalAsCompleted,markSubgoalAsCompleted,getGoalProgress,getMentorMentees,
  findMentorIdByUserId,getMentorAvailability, scheduleMeeting, getMyMeetings
  // updateRequestStatus
} from "../controllers/mentorship.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { alumniRoute } from "../middleware/alumni.middleware.js";

const router = express.Router();



router.get("/mentors", protectRoute,getMentors);
router.get('/find/:userId', findMentorIdByUserId);


// Get mentees of a mentor
router.get("/mentees", protectRoute, getMentorMentees);

router.post("/request-status", protectRoute, getMentorshipRequestStatus);


router.get("/mentor-status", protectRoute,getMentorStatus);


// Mentee requests mentorship
router.post("/request", protectRoute, requestMentorship);

// Mentor registers mentorship availability
router.post("/register", protectRoute, alumniRoute, registerMentorship);

router.get("/requests", protectRoute, alumniRoute, getMentorshipRequests);
router.put("/:id/status", protectRoute, alumniRoute, updateMentorshipStatus);
// router.get("/", protectRoute, alumniRoute, getMentorshipRequests);

// // Accept or reject a mentorship request
// router.put("/:requestId", protectRoute, alumniRoute, updateRequestStatus);

router.get("/mentee-count", protectRoute, alumniRoute, getMenteeCount);
router.get("/request-count", protectRoute, alumniRoute, getRequestCount);

router.get("/my-mentors", protectRoute, getAcceptedMentors);

router.get("/:mentorshipId/goals", protectRoute, getGoals);
router.post("/:mentorshipId/goals", protectRoute, addGoal);
router.post("/:mentorshipId/goals/:goalId/subgoals", protectRoute, addSubgoal);
router.put("/:mentorshipId/goals/:goalId/subgoals/:subgoalId", protectRoute, toggleSubgoal);
// router.delete("/:mentorshipId/goals/:goalId/subgoals/:subGoalId", protectRoute, deleteSubGoal);

router.delete("/:mentorshipId/goals/:goalId/subgoals/:subgoalId", protectRoute, deleteSubGoal);



router.delete("/:mentorshipId/goals/:goalId", protectRoute, deleteGoal);
// router.delete("/goals/:goalId", protectRoute, deleteGoal);
// router.get('/mentor/:mentorId', protectRoute, getmentorshipId);
router.get('/find', protectRoute, getmentorshipId);

router.get("/user-role", protectRoute, getUserRoleAndData);

router.put("/goals/:goalId/complete", protectRoute, markGoalAsCompleted);
router.put("/goals/:goalId/subgoals/:subgoalId/complete", protectRoute, markSubgoalAsCompleted);
router.get("/goals/:goalId/progress", protectRoute, getGoalProgress);




router.get("/mentor/:mentorId/availability",protectRoute, getMentorAvailability);
router.post("/schedule", protectRoute,scheduleMeeting);
router.get("/meetings/:userId", protectRoute, getMyMeetings);



export default router;
