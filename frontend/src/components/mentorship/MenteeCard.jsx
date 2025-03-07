import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Target, MessageCircle, Calendar } from "lucide-react";

const MenteeCard = ({ mentee }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    if (!mentee) {
        return <div className="text-red-500">Mentee data is missing</div>;
    }

    const menteeUser = mentee.mentee || mentee.user || mentee;
    const menteeName = menteeUser.name || menteeUser.fullName || "Unknown Name";
    const menteeEmail = menteeUser.email || "No email provided";
    const menteeId = menteeUser._id || mentee._id;

    const handleViewGoals = async () => {
        if (!authUser || !authUser._id) {
            console.error("User is not defined");
            return;
        }

        setLoading(true);
        try {
            // Find the mentor ID associated with the current user's ID
            const mentorResponse = await axiosInstance.get(`/mentorships/find/${authUser._id}`);

            if (!mentorResponse.data || !mentorResponse.data.mentorId) {
                console.error("Mentor ID not found");
                return; // Or handle the error as needed
            }

            const mentorId = mentorResponse.data.mentorId;

            const { data } = await axiosInstance.get(
                `/mentorships/find?mentor=${mentorId}&mentee=${menteeId}`
            );

            if (data?.mentorshipId) {
                navigate(`/mentorships/${data.mentorshipId}/goals`);
            } else {
                console.error("Mentorship ID not found through API");
                navigate(`/mentee/${menteeId}/goals`); // Fallback
            }
        } catch (error) {
            console.error("Error fetching mentorship ID:", error);
            navigate(`/mentee/${menteeId}/goals`); // Fallback
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
            <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                    {menteeName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{menteeName}</h3>
                    <p className="text-gray-600">{menteeEmail}</p>
                </div>
            </div>

            {mentee.status && (
                <div className="mb-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                        mentee.status === 'active' ? 'bg-green-100 text-green-800' :
                        mentee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {mentee.status.charAt(0).toUpperCase() + mentee.status.slice(1)}
                    </span>
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={handleViewGoals}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm shadow hover:bg-blue-600 transition disabled:opacity-70"
                >
                    <Target size={16} />
                    <span>{loading ? "Loading..." : "View Goals"}</span>
                </button>

                <Link
                    to={`/messages?user=${menteeId}`}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm shadow hover:bg-gray-300 transition"
                >
                    <MessageCircle size={16} />
                    <span>Message</span>
                </Link>

                {/* <Link
                    to={`/schedule?mentee=${menteeId}`}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm shadow hover:bg-gray-300 transition"
                >
                    <Calendar size={16} />
                    <span>Schedule</span>
                </Link> */}
            </div>
        </div>
    );
};

export default MenteeCard;