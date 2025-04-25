import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import moment from "moment";

const fetchMentorAvailability = async (mentorId) => {
  const { data } = await axiosInstance.get(`/mentorships/mentor/${mentorId}/availability`);
  return data;
};

const ScheduleMeetingPage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = moment().startOf('day');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(today);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: availability, isLoading, isError } = useQuery({
    queryKey: ["mentorAvailability", mentorId],
    queryFn: () => fetchMentorAvailability(mentorId),
    enabled: !!mentorId,
  });

  const formatTimeForBackend = (slot, date) => {
    return {
      date: moment(date).format("YYYY-MM-DD"),
      startTime: slot.startTime.trim(),
      endTime: slot.endTime.trim(),
    };
  };

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!authUser?._id || !selectedSlot || !selectedDate) {
        throw new Error("Missing required data (menteeId, timeSlot, or date)");
      }

      const { date, startTime, endTime } = formatTimeForBackend(selectedSlot, selectedDate);

      const res = await axiosInstance.post("/mentorships/schedule", {
        mentorId,
        menteeId: authUser._id,
        date,
        startTime,
        endTime,
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

  const handlePrevMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, 'month'));
  };

  const handleDateSelect = (date) => {
    if (moment(date).isBefore(today, 'day')) return;
    setSelectedDate(moment(date).startOf('day'));
    setSelectedSlot(null);
  };

  const renderCalendar = (month) => {
    const startOfMonth = moment(month).startOf('month');
    const endOfMonth = moment(month).endOf('month');
    const startDate = moment(startOfMonth).startOf('week');
    const endDate = moment(endOfMonth).endOf('week');
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(day.toDate());
      day = day.clone().add(1, 'day');
    }
    
    return days;
  };

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dayName = moment(selectedDate).format("dddd");
    return availability?.filter((slot) => slot.day === dayName) || [];
  };

  if (isLoading) return <p className="text-center mt-10">Loading availability...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Error fetching availability.</p>;

  const firstMonth = currentMonth;
  const secondMonth = moment(currentMonth).add(1, 'month');

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] py-5 flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-text dark:text-text-dark tracking-light text-[32px] font-bold leading-tight min-w-72">Schedule Meeting</p>
            </div>
            
            {/* Calendar container - Modified to prevent wrapping */}
            <div className="flex items-center justify-center gap-4 p-4 overflow-x-auto">
              {/* First Calendar */}
              <div className="flex w-[320px] flex-col gap-0.5 flex-shrink-0">
                <div className="flex items-center p-1 justify-between">
                  <button onClick={handlePrevMonth}>
                    <div className="text-text dark:text-text-dark flex size-10 items-center justify-center">
                      <ChevronLeft size={18} />
                    </div>
                  </button>
                  <p className="text-text dark:text-text-dark text-base font-bold leading-tight flex-1 text-center pr-10">
                    {firstMonth.format('MMMM YYYY')}
                  </p>
                </div>
                <div className="grid grid-cols-7">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <p key={day} className="text-text dark:text-text-dark text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">
                      {day}
                    </p>
                  ))}
                  {renderCalendar(firstMonth).map((date, index) => {
                    const day = moment(date).date();
                    const isCurrentMonth = moment(date).month() === firstMonth.month();
                    const isSelected = selectedDate && moment(date).isSame(selectedDate, 'day');
                    const dayOfWeek = moment(date).format('dddd');
                    const isAvailable = availability?.some(slot => slot.day === dayOfWeek);
                    const isPast = moment(date).isBefore(today, 'day');
                    const isDisabled = !isCurrentMonth || !isAvailable || isPast;
                    const isToday = moment(date).isSame(today, 'day');

                    return (
                      <button 
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className="h-12 w-full text-sm font-medium leading-normal"
                        disabled={isDisabled}
                      >
                        <div className={`
                          flex size-full items-center justify-center rounded-full
                          ${isSelected ? 'bg-primary dark:bg-primary-dark text-white' : ''}
                          ${isDisabled ? 'text-text-muted dark:text-text-dark-muted' : 'text-text dark:text-text-dark'}
                          ${isToday && !isSelected ? 'border-2 border-primary dark:border-primary-dark' : ''}
                        `}>
                          {day}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Second Calendar */}
              <div className="flex w-[320px] flex-col gap-0.5 flex-shrink-0">
                <div className="flex items-center p-1 justify-between">
                  <p className="text-text dark:text-text-dark text-base font-bold leading-tight flex-1 text-center pl-10">
                    {secondMonth.format('MMMM YYYY')}
                  </p>
                  <button onClick={handleNextMonth}>
                    <div className="text-text dark:text-text-dark flex size-10 items-center justify-center">
                      <ChevronRight size={18} />
                    </div>
                  </button>
                </div>
                <div className="grid grid-cols-7">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <p key={day} className="text-text dark:text-text-dark text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">
                      {day}
                    </p>
                  ))}
                  {renderCalendar(secondMonth).map((date, index) => {
                    const day = moment(date).date();
                    const isCurrentMonth = moment(date).month() === secondMonth.month();
                    const isSelected = selectedDate && moment(date).isSame(selectedDate, 'day');
                    const dayOfWeek = moment(date).format('dddd');
                    const isAvailable = availability?.some(slot => slot.day === dayOfWeek);
                    const isPast = moment(date).isBefore(today, 'day');
                    const isDisabled = !isCurrentMonth || !isAvailable || isPast;
                    const isToday = moment(date).isSame(today, 'day');

                    return (
                      <button 
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className="h-12 w-full text-sm font-medium leading-normal"
                        disabled={isDisabled}
                      >
                        <div className={`
                          flex size-full items-center justify-center rounded-full
                          ${isSelected ? 'bg-primary dark:bg-primary-dark text-white' : ''}
                          ${isDisabled ? 'text-text-muted dark:text-text-dark-muted' : 'text-text dark:text-text-dark'}
                          ${isToday && !isSelected ? 'border-2 border-primary dark:border-primary-dark' : ''}
                        `}>
                          {day}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedDate && (
              <>
                <h3 className="text-text dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                  Select time
                </h3>
                <div className="flex gap-3 p-3 flex-wrap pr-4">
                  {getSlotsForSelectedDate().map((slot) => (
                    <button
                      key={`${slot.startTime}-${slot.endTime}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 ${
                        selectedSlot === slot 
                          ? 'bg-primary dark:bg-primary-dark text-white' 
                          : 'bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark'
                      }`}
                    >
                      <p className="text-sm font-medium leading-normal">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
            
            <div className="flex px-4 py-3">
              <button
                onClick={() => scheduleMutation.mutate()}
                disabled={!selectedSlot || scheduleMutation.isLoading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-primary dark:bg-primary-dark text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
              >
                {scheduleMutation.isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <span className="truncate">Schedule Meeting</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingPage;