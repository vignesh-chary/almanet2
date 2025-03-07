import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";

const fetchMentorAvailability = async (mentorId) => {
  const { data } = await axiosInstance.get(`/mentorships/mentor/${mentorId}/availability`);
  return data;
};

const ScheduleMeetingPage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: availability, isLoading, isError } = useQuery({
    queryKey: ["mentorAvailability", mentorId],
    queryFn: () => fetchMentorAvailability(mentorId),
    enabled: !!mentorId,
  });

  const formatTimeForBackend = (slot, date) => {
    return {
      date: moment(date).format("YYYY-MM-DD"), // Send the selected date in "YYYY-MM-DD" format
      startTime: slot.startTime.trim(), // Already in "HH:mm" format
      endTime: slot.endTime.trim(), // Already in "HH:mm" format
    };
  };

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!authUser?._id || !selectedSlot || !selectedDate) {
        throw new Error("Missing required data (menteeId, timeSlot, or date)");
      }

      const { date, startTime, endTime } = formatTimeForBackend(selectedSlot, selectedDate);

      console.log("Scheduling meeting with:", {
        mentorId,
        menteeId: authUser._id,
        date,
        startTime,
        endTime,
      });

      const res = await axiosInstance.post("/mentorships/schedule", {
        mentorId,
        menteeId: authUser._id,
        date, // Include the selected date
        startTime, // Include startTime
        endTime, // Include endTime
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myMeetings"]);
      toast.success("Meeting scheduled successfully!");
      navigate("/meetings");
    },
    onError: (error) => {
      console.error("Schedule Meeting Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to schedule meeting");
    },
  });

  if (isLoading) return <p className="text-center mt-10">Loading availability...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Error fetching availability.</p>;

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dayOfWeek = moment(date).format("dddd"); // Full day name (e.g., "Friday")
      const isAvailable = availability?.some((slot) => slot.day === dayOfWeek);
      const isPast = moment(date).isBefore(moment(), "day");

      if (isAvailable && !isPast) {
        return "available-date";
      }
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dayName = moment(selectedDate).format("dddd"); // Full day name (e.g., "Friday")
    return availability?.filter((slot) => slot.day === dayName) || [];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Schedule a Meeting</h2>
      <p className="text-gray-600 mb-2">Select a date and time slot with your mentor.</p>

      <div className="mb-4">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
        />
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
          {getSlotsForSelectedDate().length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {getSlotsForSelectedDate().map((slot) => (
                <button
                  key={slot._id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-md border ${
                    selectedSlot === slot ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-4">No available slots for selected date.</p>
          )}
        </div>
      )}

      <button
        onClick={() => scheduleMutation.mutate()}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md w-full disabled:bg-gray-400"
        disabled={!selectedSlot || scheduleMutation.isLoading}
      >
        {scheduleMutation.isLoading ? <Loader2 className="animate-spin" /> : "Schedule Meeting"}
      </button>
    </div>
  );
};

export default ScheduleMeetingPage;