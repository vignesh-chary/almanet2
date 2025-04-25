import axios from "axios";

const RECOMMENDATION_API_URL = "http://localhost:8000/recommend";
const MENTOR_RECOMMENDATION_API_URL = "http://localhost:8000/recommend-mentors";
const JOB_RECOMMENDATION_API_URL = "http://localhost:8000/recommend-jobs";

export const getRecommendations = async (userId, users) => {
    try {
        const response = await axios.post(RECOMMENDATION_API_URL, {
            user_id: userId,
            users: users,
        });
        return response.data.recommendations;
    } catch (error) {
        console.error("Error fetching recommendations:", error.response?.data || error.message);
        throw new Error("Failed to fetch recommendations");
    }
};

export const getMentorRecommendations = async (student, mentors) => {
    try {
        const response = await axios.post(MENTOR_RECOMMENDATION_API_URL, {
            student: student, // Send the student object
            mentors: mentors, // Send the mentors array
        });
        return response.data.recommendations;
    } catch (error) {
        console.error("Error fetching mentor recommendations:", error.response?.data || error.message);
        throw new Error("Failed to fetch mentor recommendations");
    }
};

export const getJobRecommendations = async (user, jobs) => {
    try {
        const response = await axios.post(JOB_RECOMMENDATION_API_URL, {
            user: user,
            jobs: jobs,
        });
        return response.data.recommendations;
    } catch (error) {
        console.error("Error fetching job recommendations:", error.response?.data || error.message);
        throw new Error("Failed to fetch job recommendations");
    }
};