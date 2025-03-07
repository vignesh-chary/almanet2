import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { useNavigate } from "react-router-dom";

const fetchMyMeetings = async (userId) => {
  const { data } = await axiosInstance.get(`/mentorships/meetings/${userId}`);
  return data;
};

const MyMeetingsPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const navigate = useNavigate();

  const { data: meetings, isLoading, isError } = useQuery({
    queryKey: ["myMeetings", authUser?._id],
    queryFn: () => fetchMyMeetings(authUser?._id),
    enabled: !!authUser?._id,
  });

  if (isLoading) return <p className="text-center mt-10">Loading meetings...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Error fetching meetings.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">My Scheduled Meetings</h2>

      {meetings?.length === 0 ? (
        <p className="text-gray-600 text-center">No meetings scheduled.</p>
      ) : (
        <div className="space-y-4">
          {meetings?.map((meeting) => {
            const targetDate = `${meeting.date}T${meeting.startTime}:00`;
            const isAlumni = authUser?.role === "alumni";
            const userDetails = isAlumni ? meeting.menteeId : meeting.mentorId;

            return (
              <div
                key={meeting._id}
                className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={userDetails?.profilePicture || ""}
                      alt={userDetails?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    {/* Display Name and Username */}
                    <p className="text-lg font-semibold">{userDetails?.name || "Unknown User"}</p>
                    <p className="text-sm text-gray-500">
                      @{userDetails?.username || "unknown"} | {isAlumni ? "Mentee" : "Mentor"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} />
                    <p>{meeting.date}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} />
                    <p>{meeting.startTime} - {meeting.endTime}</p>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Time until meeting:</p>
                  <CountdownTimer targetDate={targetDate} />
                </div>

                <a
                  href={meeting.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                >
                  <ExternalLink size={16} />
                  Join Meeting
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyMeetingsPage;
