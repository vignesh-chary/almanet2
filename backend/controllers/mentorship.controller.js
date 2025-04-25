import Mentorship from "../models/mentorship.model.js";
import Mentor from "../models/mentor.model.js";
import User from "../models/user.model.js";
import Goal from "../models/goal.model.js";
import Meeting from "../models/Meeting.model.js";

/**
 * Mentee requests mentorship from a mentor
 */



export const requestMentorship = async (req, res) => {
  try {
    const { mentorId, message, mentorshipType } = req.body;

    // Ensure mentee is logged in (extracted from auth middleware)
    const menteeId = req.user._id;

    if (!mentorId || !mentorshipType) {
      return res.status(400).json({ message: "Mentor ID and mentorship type are required." });
    }

    const mentorshipRequest = new Mentorship({
      mentor: mentorId,
      mentee: menteeId,
      message,
      mentorshipType,
      status: "pending"
    });

    await mentorshipRequest.save();
    res.status(201).json({ message: "Mentorship request sent successfully!", mentorshipRequest });
  } catch (error) {
    console.error("Mentorship request error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




/**
 * Mentor registers for mentorship
 */
// export const registerMentorship = async (req, res) => {
//   try {
//     const { expertise, industry, availability, bio, linkedin } = req.body;
//     const mentorId = req.user.id; // Authenticated user

//     // Check if the mentor already registered
//     const existingMentor = await Mentor.findOne({ userId: mentorId });

//     if (existingMentor) {
//       return res.status(400).json({ message: "You are already registered as a mentor." });
//     }

//     // Create mentor profile
//     const mentor = new Mentor({
//       userId: mentorId,
//       expertise,
//       industry,
//       availability,
//       bio,
//       linkedin,
//     });

//     await mentor.save();
//     res.status(201).json({ message: "Mentor profile created successfully", mentor });
//   } catch (error) {
//     res.status(500).json({ message: "Error registering as a mentor", error: error.message });
//   }
// };
export const registerMentorship = async (req, res) => {
  try {
    const { expertise, industry, availability, bio, linkedin } = req.body;
    const mentorId = req.user.id; // Authenticated user ID

    // Fetch user details from User model
    const user = await User.findById(mentorId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the mentor is already registered
    const existingMentor = await Mentor.findOne({ userId: mentorId });
    if (existingMentor) {
      return res.status(400).json({ message: "You are already registered as a mentor." });
    }

    // Validate required fields
    if (!expertise || expertise.length === 0) {
      return res.status(400).json({ message: "At least one expertise area is required." });
    }
    if (!industry) {
      return res.status(400).json({ message: "Industry is required." });
    }
    if (!availability || availability.length === 0) {
      return res.status(400).json({ message: "At least one availability slot is required." });
    }

    // Ensure availability format is correct
    const validAvailability = availability.every(slot => slot.day && slot.startTime && slot.endTime);
    if (!validAvailability) {
      return res.status(400).json({ message: "Each availability slot must have a day, startTime, and endTime." });
    }

    // Create mentor profile with user details autofilled
    const mentor = new Mentor({
      userId: mentorId,
      name: user.name, // Autofill name from User model
      email: user.email, // Autofill email from User model
      expertise,
      industry,
      availability,
      bio: bio || "No bio available", // Default bio if not provided
      linkedin,
      rating: 1, // Default rating (since 0 is not allowed)
      totalSessions: 0, // Default total sessions
    });

    await mentor.save();
    res.status(201).json({ message: "Mentor profile created successfully", mentor });
  } catch (error) {
    res.status(500).json({ message: "Error registering as a mentor", error: error.message });
  }
};

/**
 * Fetch mentorship requests for a mentor
 */
export const getMentorshipRequests = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Ensure the user is a registered mentor
    const mentor = await Mentor.findOne({ userId: mentorId });
    if (!mentor) {
      return res.status(403).json({ message: "You are not registered as a mentor." });
    }

    // Fetch mentorship requests and populate mentee details from the User model
    const requests = await Mentorship.find({ mentor: mentor._id, status: "pending" })
      .populate({
        path: "mentee", // Reference to the mentee field in Mentorship model
        select: "username profilePicture", // Fields to fetch from the User model
      })
      .select("mentee message status mentorshipType");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mentorship requests", error });
  }
};

export const updateMentorshipStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    if (!["pending", "accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update mentorship status
    const mentorship = await Mentorship.findById(id);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship request not found" });
    }

    // Ensure only the assigned mentor can update the status
    const mentor = await Mentor.findOne({ userId: req.user.id });
    if (!mentor || mentorship.mentor.toString() !== mentor._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this request." });
    }

    mentorship.status = status;
    await mentorship.save();

    res.status(200).json({ message: "Mentorship status updated successfully", mentorship });
  } catch (error) {
    res.status(500).json({ message: "Error updating mentorship status", error });
  }
};
//  export const updateMentorshipStatus = async (req, res) => {
//   try {
//     const { mentorshipId } = req.params;
//     const { status } = req.body;

//     const mentorshipRequest = await Mentorship.findById(mentorshipId);
//     if (!mentorshipRequest) {
//       return res.status(404).json({ message: "Mentorship request not found" });
//     }

//     mentorshipRequest.status = status;
//     await mentorshipRequest.save();

//     res.json({ message: `Mentorship request ${status}` });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating mentorship status", error });
//   }
// };




/**
 * Fetch all registered mentors
 */

//   try {
//     const { location, availability, industry, expertise } = req.query;

//     let filter = {};

//     if (location) filter.location = location;
//     if (availability) filter.availability = availability;
//     if (industry) filter.industry = industry;
//     if (expertise) filter.expertise = { $regex: expertise, $options: "i" }; // Case-insensitive search

//     const mentors = await Mentor.find(filter)
//       .populate("userId", "name email username profilePicture") // Fetch profile picture
//       .select("userId expertise industry linkedin location availability");

//     res.json(mentors);
//   } catch (error) {
//     console.error("Error fetching mentors:", error);
//     res.status(500).json({ message: "Error fetching mentors" });
//   }
// };

export const getMentors = async (req, res) => {
  try {
    const { searchQuery, expertise, industry } = req.query;
    let filter = {};

    // Search Query (Name or Expertise)
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { expertise: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Expertise filter
    if (expertise) {
      filter.expertise = { $regex: expertise, $options: "i" };
    }

    // Industry filter - use exact match
    if (industry) {
      filter.industry = industry;
    }

    // Fetch mentors with filters
    const mentors = await Mentor.find(filter)
      .populate("userId", "name email username profilePicture") // Populate user details
      .select("userId expertise industry linkedin availability");

    res.status(200).json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ message: "Error fetching mentors" });
  }
};

// export const getMentors = async (req, res) => {
//   try {
//     const { expertise, industry, availability, searchQuery } = req.query;
//     let filter = {};

//     // Add filters based on query parameters
//     if (expertise) filter.expertise = { $regex: expertise, $options: "i" };
//     if (industry) filter.industry = { $regex: industry, $options: "i" };
//     if (availability) filter["availability.day"] = { $regex: availability, $options: "i" };

//     // Search Query (Name or Expertise)
//     if (searchQuery) {
//       filter.$or = [
//         { name: { $regex: searchQuery, $options: "i" } },
//         { expertise: { $regex: searchQuery, $options: "i" } },
//       ];
//     }

//     // Fetch mentors with filters
//     const mentors = await Mentor.find(filter)
//       .populate("userId", "name email username profilePicture") // Populate user details
//       .select("userId expertise industry linkedin availability");

//     res.status(200).json(mentors);
//   } catch (error) {
//     console.error("Error fetching mentors:", error);
//     res.status(500).json({ message: "Error fetching mentors" });
//   }
// };




/**
 * Check if a user is a registered mentor
 */
export const getMentorStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const mentor = await Mentor.findOne({ userId });

    res.json({ isMentor: !!mentor });
  } catch (error) {
    console.error("Error fetching mentor status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



/**
 * Get the number of unique mentees for a mentor
 */
export const getMenteeCount = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find the mentor using userId
    const mentor = await Mentor.findOne({ userId: mentorId });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    // Count unique mentees with accepted or completed mentorships
    const menteeCount = await Mentorship.distinct("mentee", {
      mentor: mentor._id,
      status: { $in: ["accepted", "completed"] },
    });

    res.status(200).json({ menteeCount: menteeCount.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching mentee count", error: error.message });
  }
};

/**
 * Get the number of pending mentorship requests for a mentor
 */
export const getRequestCount = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find the mentor using userId
    const mentor = await Mentor.findOne({ userId: mentorId });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    // Count the number of pending mentorship requests
    const requestCount = await Mentorship.countDocuments({
      mentor: mentor._id,
      status: "pending",
    });

    res.status(200).json({ requestCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching request count", error: error.message });
  }
};


/**
 * Get mentorship request status for a mentor
 */


export const getMentorshipRequestStatus = async (req, res) => {
  try {
    const { mentorIds } = req.body;

    // Validate mentorIds
    if (!mentorIds || !Array.isArray(mentorIds)) {
      return res.status(400).json({ error: "Invalid mentorIds format" });
    }

    // Fetch request statuses for all provided mentor IDs
    const statuses = {};
    for (const mentorId of mentorIds) {
      const request = await Mentorship.findOne({
        mentor: mentorId, // Ensure this matches the field name in your Mentorship model
        mentee: req.user._id, // Ensure this matches the field name in your Mentorship model
      });

      // If a request exists, store its status; otherwise, set status to null
      statuses[mentorId] = request ? request.status : null;
    }

    res.json(statuses);
  } catch (error) {
    console.error("Error fetching mentorship request statuses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getAcceptedMentors = async (req, res) => {
//   try {
//     const menteeId = req.user._id; // Logged-in user (mentee)

//     // Find all mentorship requests where the mentee is the logged-in user and status is "accepted"
//     const mentorships = await Mentorship.find({ mentee: menteeId, status: "accepted" })
//       .populate({
//         path: "mentor", // Populate the mentor field
//         select: "name username profilePicture expertise industry", // Select required fields
//       });

//     // Format the response
//     const mentors = mentorships.map((mentorship) => ({
//       mentorId: mentorship.mentor._id,
//       name: mentorship.mentor.name,
//       username: mentorship.mentor.username,
//       profilePicture: mentorship.mentor.profilePicture,
//       expertise: mentorship.mentor.expertise,
//       industry: mentorship.mentor.industry,
//     }));

//     res.json(mentors);
//   } catch (error) {
//     console.error("Error fetching accepted mentors:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
export const getAcceptedMentors = async (req, res) => {
  try {
    const menteeId = req.user._id; // Logged-in user (mentee)

    // Find all mentorships where mentee is logged-in user and status is "accepted"
    const mentorships = await Mentorship.find({ mentee: menteeId, status: "accepted" })
      .populate({
        path: "mentor",
        select: "name email industry expertise photoUrl userId", // Also fetch userId to get profilePicture
        populate: {
          path: "userId", // Populate userId from User model
          select: "profilePicture", // Only fetch profilePicture from User
        },
      });

    // Format the response
    const mentors = mentorships.map((mentorship) => ({
      mentorId: mentorship.mentor._id,
      name: mentorship.mentor.name,
      email: mentorship.mentor.email,
      industry: mentorship.mentor.industry,
      expertise: mentorship.mentor.expertise,
      profilePicture: mentorship.mentor.userId?.profilePicture || mentorship.mentor.photoUrl || "", // Prioritize User profilePicture
    }));

    res.json(mentors);
  } catch (error) {
    console.error("Error fetching accepted mentors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// GOALS


import mongoose from "mongoose";

// Fetch goals with subgoals
export const getGoals = async (req, res) => {
  try {
    const { mentorshipId } = req.params;

    if (!mentorshipId) {
      return res.status(400).json({ error: "Mentorship ID is required." });
    }

    const goals = await Goal.find({ mentorship: mentorshipId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a goal (with optional subgoals)
export const addGoal = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { text, setBy } = req.body; // Removed subgoals from here

    if (!mentorshipId || !text || !setBy) {
      return res.status(400).json({ error: "Mentorship ID, text, and setBy are required." });
    }

    const goal = await Goal.create({
      mentorship: mentorshipId,
      text,
      setBy,
      subgoals: [], // Initialize subgoals as an empty array
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error("Error adding goal:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a subgoal to an existing goal
export const addSubgoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Subgoal text is required." });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    goal.subgoals.push({ text, completed: false });

    await goal.save();
    res.status(201).json({ message: "Subgoal added successfully.", subgoals: goal.subgoals });
  } catch (error) {
    console.error("Error adding subgoal:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Toggle Subgoal Completion
export const toggleSubgoal = async (req, res) => {
  try {
    const { goalId, subgoalId } = req.params;
    const { completed } = req.body; // Get the completed status from the request body

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, "subgoals._id": subgoalId },
      { $set: { "subgoals.$.completed": completed } }, // Use the value from the body
      { new: true, runValidators: true }
    ).populate("subgoals");

    if (!goal) {
      return res.status(404).json({ error: "Subgoal not found." });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("Error updating subgoal:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a goal and its subgoals (improved)
export const deleteGoal = async (req, res) => {
  try {
    const { mentorshipId, goalId } = req.params;

    if (!goalId || !mentorshipId) {
      return res.status(400).json({ error: "Mentorship ID and Goal ID are required." });
    }

    const goal = await Goal.findOneAndDelete({ _id: goalId, mentorship: mentorshipId }); // Combined find and delete

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.status(200).json({ message: "Goal and related subgoals deleted successfully", deletedGoalId: goalId });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const deleteSubGoal = async (req, res) => {
  try {
    const { goalId, subgoalId } = req.params;

    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { $pull: { subgoals: { _id: new mongoose.Types.ObjectId(subgoalId) } } }, // Convert subgoalId to ObjectId
      { new: true, runValidators: true }
    ).populate("subgoals");

    if (!goal) {
      return res.status(404).json({ error: "Subgoal not found" });
    }

    res.status(200).json({ message: "Subgoal deleted successfully", deletedSubGoalId: subgoalId });
  } catch (error) {
    console.error("Error deleting subgoal:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Save multiple goals (optional)
// export const saveGoals = async (req, res) => {
//   try {
//     const { mentorshipId } = req.params;
//     const { goals } = req.body;

//     if (!mentorshipId) {
//       return res.status(400).json({ error: "Mentorship ID is required." });
//     }

//     // Delete existing goals for this mentorship
//     await Goal.deleteMany({ mentorship: mentorshipId });

//     // Add new goals
//     const savedGoals = await Goal.insertMany(goals);

//     res.status(200).json(savedGoals);
//   } catch (error) {
//     console.error("Error saving goals:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


export const getmentorshipId = async (req, res) => {
  try {
    const { mentor, mentee } = req.query; // Get from req.query

    if (!mentor || !mentee) {
      return res.status(400).json({ error: "Mentor and Mentee IDs are required." });
    }

    // Find the mentorship using BOTH mentor and mentee IDs (Crucial)
    const mentorship = await Mentorship.findOne({ mentor: mentor, mentee: mentee }); // Example query

    if (!mentorship) {
      return res.status(404).json({ error: "Mentorship not found" });
    }

    res.json({ mentorshipId: mentorship._id });
  } catch (error) {
    console.error("Error fetching mentorship ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getUserRoleAndData = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user ID

    // Check if the user is a mentor (alumni)
    const mentor = await Mentor.findOne({ userId });
    if (mentor) {
      return res.status(200).json({ role: "mentor", data: mentor });
    }

    // Check if the user is a mentee (student)
    const mentee = await Mentee.findOne({ userId });
    if (mentee) {
      return res.status(200).json({ role: "mentee", data: mentee });
    }

    // If neither, return an error
    res.status(404).json({ message: "User role not found" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user role", error: error.message });
  }
};


//goals-completions
export const markGoalAsCompleted = async (req, res) => {
  try {
    const { goalId } = req.params;

    // Mark the goal as completed and all its subgoals as completed
    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { $set: { completed: true, "subgoals.$[].completed": true } }, // Mark all subgoals as completed
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error marking goal as completed", error: error.message });
  }
};

export const markSubgoalAsCompleted = async (req, res) => {
  try {
    const { goalId, subgoalId } = req.params;

    // Mark the subgoal as completed
    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, "subgoals._id": subgoalId },
      { $set: { "subgoals.$.completed": true } },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal or subgoal not found" });
    }

    // Check if all subgoals are completed
    const allSubgoalsCompleted = goal.subgoals.every((subgoal) => subgoal.completed);

    // If all subgoals are completed, mark the goal as completed
    if (allSubgoalsCompleted) {
      const updatedGoal = await Goal.findByIdAndUpdate(
        goalId,
        { $set: { completed: true } },
        { new: true }
      );
      return res.status(200).json(updatedGoal);
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error marking subgoal as completed", error: error.message });
  }
};

export const getGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Calculate progress
    const totalSubgoals = goal.subgoals.length;
    const completedSubgoals = goal.subgoals.filter((subgoal) => subgoal.completed).length;
    const progress = totalSubgoals > 0 ? (completedSubgoals / totalSubgoals) * 100 : goal.completed ? 100 : 0;

    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ message: "Error calculating goal progress", error: error.message });
  }
};


export const getMentorMentees = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.id });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    const mentees = await Mentorship.find({
      mentor: mentor._id,
      status: "accepted",
    }).populate("mentee", "name email photoUrl");

    res.json(mentees.map(m => m.mentee));
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};





//new controller for something in mentorship dashboard

export const findMentorIdByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const mentor = await Mentor.findOne({ userId: userId });

    if (mentor) {
      res.json({ mentorId: mentor._id });
    } else {
      res.status(404).json({ message: 'Mentor not found' });
    }
  } catch (error) {
    console.error('Error finding mentor ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






export const getMentorAvailability = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentor.availability);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


import moment from 'moment';


// export const scheduleMeeting = async (req, res) => {
//   try {
//     const { mentorId, menteeId, date, startTime, endTime } = req.body;

//     // Validate mentor existence
//     const mentor = await Mentor.findById(mentorId);
//     if (!mentor) return res.status(404).json({ message: "Mentor not found" });

//     // Convert date to a weekday name to match stored availability
//     const selectedDay = moment(date).format("dddd");

//     console.log("📌 Schedule Request:", { mentorId, menteeId, date, startTime, endTime, selectedDay });
//     console.log("🟢 Mentor's Availability:", mentor.availability);

//     // Find an available slot
//     const availableSlot = mentor.availability.find((slot) => {
//       console.log(`Checking slot: ${slot.day} ${slot.startTime} - ${slot.endTime}`);

//       return (
//         slot.day === selectedDay &&
//         slot.startTime === startTime &&
//         slot.endTime === endTime
//       );
//     });

//     if (!availableSlot) {
//       return res.status(400).json({ message: "Selected time is not available" });
//     }

//     // Generate a meeting link
//     const meetLink = `https://meet.example.com/${mentorId}-${menteeId}-${Date.now()}`;

//     // Save meeting
//     const newMeeting = new Meeting({ mentorId, menteeId, date, startTime, endTime, meetLink });
//     await newMeeting.save();

//     res.status(201).json({ message: "Meeting scheduled successfully", meetLink });
//   } catch (error) {
//     console.error("❌ Schedule Meeting Error:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

import { google } from "googleapis";

export const scheduleMeeting = async (req, res) => {
  try {
    const { mentorId, menteeId, date, startTime, endTime } = req.body;

    // Validate mentor existence
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    // Convert date to a weekday name to match stored availability
    const selectedDay = moment(date).format("dddd");

    console.log("📌 Schedule Request:", { mentorId, menteeId, date, startTime, endTime, selectedDay });
    console.log("🟢 Mentor's Availability:", mentor.availability);

    // Find an available slot
    const availableSlot = mentor.availability.find((slot) => {
      console.log(`Checking slot: ${slot.day} ${slot.startTime} - ${slot.endTime}`);

      return (
        slot.day === selectedDay &&
        slot.startTime === startTime &&
        slot.endTime === endTime
      );
    });

    if (!availableSlot) {
      return res.status(400).json({ message: "Selected time is not available" });
    }

    // Generate a Google Meet link
    const meetLink = `https://meet.google.com/new?authuser=${mentor.email}`;

    // Save meeting
    const newMeeting = new Meeting({ mentorId, menteeId, date, startTime, endTime, meetLink });
    await newMeeting.save();

    res.status(201).json({ message: "Meeting scheduled successfully", meetLink });
  } catch (error) {
    console.error("❌ Schedule Meeting Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};





export const getMyMeetings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log("Received User ID:", userId);

    // Check if user is a mentor
    const mentor = await Mentor.findOne({ userId: userObjectId });

    let mentorObjectId = null;
    if (mentor) {
      mentorObjectId = mentor._id; // Mentor's actual ID used in the meetings model
      console.log("Mapped Mentor ID:", mentorObjectId);
    }

    // Find meetings where the user is either a mentor or mentee
    const queryConditions = [
      { menteeId: userObjectId }, // Match menteeId directly
    ];

    if (mentorObjectId) {
      queryConditions.push({ mentorId: mentorObjectId }); // Match mentorId correctly
    }

    const meetings = await Meeting.find({ $or: queryConditions })
      .populate({
        path: "mentorId",
        select: "name username profilePicture industry",
      })
      .populate({
        path: "menteeId",
        select: "name username profilePicture industry",
      });

    console.log("Fetched Meetings:", meetings);

    res.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// export const getMyMeetings = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const meetings = await Meeting.find({
//       $or: [{ mentorId: userId }, { menteeId: userId }],
//     })
//       .populate({
//         path: "mentorId",
//         select: "name username profilePicture industry",
//       }) // Populate mentor details, including username
//       .populate({
//         path: "menteeId",
//         select: "name username profilePicture industry",
//       }); // Populate mentee details, including username

//     res.json(meetings);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

export const getStats = async (req, res) => {
  try {
    console.log("Fetching stats...");

    // Get total number of mentors
    const totalMentors = await Mentor.countDocuments();
    console.log("Total mentors:", totalMentors);

    // Get total number of active engagements (mentorships with status "accepted")
    const activeEngagements = await Mentorship.countDocuments({ status: "accepted" });
    console.log("Active engagements:", activeEngagements);

    // Get total number of successful mentorships (mentorships with status "completed")
    const successfulMentorships = await Mentorship.countDocuments({ status: "completed" });
    console.log("Successful mentorships:", successfulMentorships);

    res.status(200).json({
      totalMentors,
      activeEngagements,
      successfulMentorships
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

export const getMentorDashboardStats = async (req, res) => {
  try {
    const mentorId = req.user.id;
    
    // Find the mentor using userId
    const mentor = await Mentor.findOne({ userId: mentorId });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    // Get total mentees (accepted and completed mentorships)
    const totalMentees = await Mentorship.countDocuments({
      mentor: mentor._id,
      status: { $in: ["accepted", "completed"] }
    });

    // Get active goals using the Goal model
    const activeGoals = await Goal.countDocuments({
      mentorship: { $in: await Mentorship.find({ mentor: mentor._id, status: "accepted" }).distinct('_id') },
      completed: false
    });

    // Get upcoming sessions using the Meeting model
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingSessions = await Meeting.countDocuments({
      mentorId: mentor._id,
      date: { $gte: today.toISOString().split('T')[0] }, // Format: YYYY-MM-DD
      status: "scheduled"
    });

    // Get additional stats for better insights
    const completedGoals = await Goal.countDocuments({
      mentorship: { $in: await Mentorship.find({ mentor: mentor._id }).distinct('_id') },
      completed: true
    });

    const totalGoals = activeGoals + completedGoals;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    res.status(200).json({
      totalMentees,
      activeGoals,
      upcomingSessions,
      completedGoals,
      totalGoals,
      completionRate: Math.round(completionRate)
    });
  } catch (error) {
    console.error("Error fetching mentor dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
};