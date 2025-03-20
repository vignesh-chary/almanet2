

import User from "../models/user.model.js";
import Mentor from "../models/mentor.model.js"; // Import the Mentor model
import { getRecommendations, getMentorRecommendations } from "../services/recommendationService.js"; // Import getMentorRecommendations
import ConnectionRequest from "../models/connectionRequest.model.js";

export const getRecommendedUsers = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch the current user's connections
        const currentUser = await User.findById(userId).select("connections");

        // Fetch all users
        let users = await User.find({}).select("_id name profilePicture headline skills industry education username");

        // Filter out already connected users
        users = users.filter(user => !currentUser.connections.includes(user._id) && user._id.toString() !== userId);

        // Fetch the current user data
        const currentUserData = await User.findById(userId).select("_id name username skills industry education");

        // Format users data with default values for empty fields, including current user
        const formattedUsers = [currentUserData, ...users].map(user => ({
            _id: user._id.toString(),
            name: user.name,
            username: user.username,
            skills: user.skills?.length ? user.skills : ["No skills"],
            industry: user.industry || "No industry",
            education: user.education?.length ? user.education : [{ fieldOfStudy: "No education" }],
        }));

        // Get recommendations from FastAPI
        const recommendations = await getRecommendations(userId, formattedUsers);

        // Filter out the current user from recommendations
        const filteredRecommendations = recommendations.filter(user => user._id !== userId);

        // Fetch connection requests for status
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { sender: userId, status: "pending" },
                { recipient: userId, status: "pending" },
            ],
        });

        // Add connection status
        const recommendedUsersWithStatus = filteredRecommendations.map(user => {
            const hasPendingRequest = connectionRequests.some(
                request =>
                    (request.sender.toString() === userId && request.recipient.toString() === user._id) ||
                    (request.sender.toString() === user._id && request.recipient.toString() === userId)
            );

            return {
                ...user,
                connectionStatus: hasPendingRequest ? "pending" : "not_connected",
            };
        });

        res.json(recommendedUsersWithStatus);
    } catch (error) {
        console.error("Error in getRecommendedUsers:", error);
        res.status(500).json({ message: error.message });
    }
};



export const getRecommendedMentors = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch the current user (student) data
        const student = await User.findById(userId).select("skills industry education experience");

        // Fetch all mentors and populate the userId field with all necessary details
        const mentors = await Mentor.find({}).populate({
            path: "userId",
            select: "name username profilePicture skills experience education", // Populate these fields
        });

        // Format mentors data
        const formattedMentors = mentors.map(mentor => {
            if (!mentor.userId) {
                throw new Error(`Mentor ${mentor._id} has no associated user data.`);
            }

            return {
                _id: mentor._id.toString(),
                userId: {
                    _id: mentor.userId._id.toString(),
                    name: mentor.userId.name,
                    username: mentor.userId.username,
                    profilePicture: mentor.userId.profilePicture,
                    skills: mentor.userId.skills || [], // Use skills from User model
                    experience: mentor.userId.experience || [], // Use experience from User model
                    education: mentor.userId.education || [], // Use education from User model
                },
                expertise: mentor.expertise || [], // Use expertise from Mentor model
                industry: mentor.industry || "No industry", // Use industry from Mentor model
                bio: mentor.bio || "No bio", // Use bio from Mentor model
            };
        });

        // Get mentor recommendations from FastAPI
        const recommendations = await getMentorRecommendations(student, formattedMentors);

        // Add required details to the recommended mentors
        const recommendedMentors = recommendations.map(recommendation => {
            const mentor = formattedMentors.find(m => m._id === recommendation._id);
            return {
                ...mentor,
                similarityScore: recommendation.similarityScore, // Add similarity score if available
            };
        });

        res.json(recommendedMentors);
    } catch (error) {
        console.error("Error in getRecommendedMentors:", error);
        res.status(500).json({ message: error.message });
    }
};