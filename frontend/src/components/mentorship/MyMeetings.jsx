import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Calendar, Clock, ExternalLink, Plus } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

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

  if (isLoading) return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <p className="text-center mt-10">Loading meetings...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <p className="text-center mt-10 text-red-500">Error fetching meetings.</p>
      </div>
    </div>
  );

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const categorizeMeetings = () => {
    const past = [];
    const todayMeetings = [];
    const upcoming = [];

    meetings?.forEach((meeting) => {
      const meetingEnd = new Date(`${meeting.date}T${meeting.endTime}:00`);
      if (meetingEnd < now) {
        past.push(meeting);
      } else if (meeting.date === today) {
        todayMeetings.push(meeting);
      } else {
        upcoming.push(meeting);
      }
    });

    return { past, todayMeetings, upcoming };
  };

  const { past, todayMeetings, upcoming } = categorizeMeetings();

  const renderMeetingCard = (meeting) => {
    const mentorDetails = meeting.mentorId;
    const targetDate = `${meeting.date}T${meeting.startTime}:00`;

    return (
      <div
        key={meeting._id}
        className="p-6 border border-[#E9DFCE] dark:border-border-dark rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-card-dark"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E9DFCE] dark:border-border-dark">
            <img
              src={mentorDetails?.profilePicture || "/default-avatar.png"}
              alt={mentorDetails?.name || "Mentor"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1C160C] dark:text-text-dark">Mentorship Session</p>
            <p className="text-sm text-[#A18249] dark:text-text-dark-muted">
              with {mentorDetails?.name || "Unknown Mentor"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-[#1C160C] dark:text-text-dark">
            <Calendar size={16} className="text-[#019863] dark:text-primary-dark" />
            <p>{meeting.date}</p>
          </div>
          <div className="flex items-center gap-2 text-[#1C160C] dark:text-text-dark">
            <Clock size={16} className="text-[#019863] dark:text-primary-dark" />
            <p>{meeting.startTime} - {meeting.endTime}</p>
          </div>
        </div>

        {meeting.date === today ? (
          <a
            href={meeting.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-[#019863] text-white px-4 py-2 rounded-lg hover:bg-[#01794d] transition-colors duration-300"
          >
            <ExternalLink size={16} />
            Join Meeting
          </a>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-[#A18249] dark:text-text-dark-muted">Time until meeting:</p>
            <CountdownTimer targetDate={targetDate} />
          </div>
        )}
      </div>
    );
  };

  const renderPastMeeting = (meeting) => {
    const mentorDetails = meeting.mentorId;

    return (
      <div
        key={meeting._id}
        className="p-4 border-b border-[#E9DFCE] dark:border-border-dark flex items-center justify-between hover:bg-[#F9F6F0] dark:hover:bg-background-dark transition-colors"
      >
        <div>
          <p className="font-semibold text-[#1C160C] dark:text-text-dark">Mentorship Session</p>
          <p className="text-sm text-[#A18249] dark:text-text-dark-muted">
            with {mentorDetails?.name || "Unknown Mentor"} • {meeting.date}
          </p>
        </div>
        <span className="text-sm text-[#A18249] dark:text-text-dark-muted">{meeting.startTime}</span>
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-[#F9F6F0] dark:bg-background-dark min-h-screen ml-80">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#1C160C] dark:text-text-dark">My Meetings</h2>
            {/* <button
              onClick={() => navigate("/find-mentor")}
              className="flex items-center gap-2 bg-[#019863] text-white px-4 py-2 rounded-full hover:bg-[#01794d] transition-colors"
            >
              <Plus size={16} />
              <span>New Meeting</span>
            </button> */}
          </div>

          {meetings?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#1C160C] dark:text-text-dark text-lg mb-2">No meetings scheduled</p>
              <p className="text-[#A18249] dark:text-text-dark-muted mb-4">Start a new meeting or schedule one in the future</p>
              <button
                onClick={() => navigate("/find-mentor")}
                className="bg-[#019863] text-white px-6 py-2 rounded-full hover:bg-[#01794d] transition-colors"
              >
                New Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {upcoming.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#019863] dark:text-primary-dark">Upcoming Sessions</h3>
                  {upcoming.map((meeting) => renderMeetingCard(meeting))}
                </div>
              )}

              {todayMeetings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#019863] dark:text-primary-dark">Today's Sessions</h3>
                  {todayMeetings.map((meeting) => renderMeetingCard(meeting))}
                </div>
              )}

              {past.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1C160C] dark:text-text-dark">Past Sessions</h3>
                  <div className="border border-[#E9DFCE] dark:border-border-dark rounded-lg bg-white dark:bg-card-dark">
                    {past.map((meeting) => renderPastMeeting(meeting))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMeetingsPage;