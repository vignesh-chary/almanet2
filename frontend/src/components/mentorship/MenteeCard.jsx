import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { 
  Target, MessageCircle, Calendar, Loader2, Mail, User, Clock, 
  Star, Award, TrendingUp, Bookmark, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

const MenteeCard = ({ mentee }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [mentorId, setMentorId] = useState(null);
    const [goals, setGoals] = useState([]);
    const [lastInteraction, setLastInteraction] = useState(null);
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    // Fetch mentor ID and additional data
    useEffect(() => {
        const fetchData = async () => {
            if (!authUser?._id) return;
            try {
                const mentorResponse = await axiosInstance.get(`/mentorships/find/${authUser._id}`);
                if (mentorResponse.data?.mentorId) {
                    setMentorId(mentorResponse.data.mentorId);
                    
                    const mentorshipResponse = await axiosInstance.get(
                        `/mentorships/find?mentor=${mentorResponse.data.mentorId}&mentee=${mentee._id}`
                    );
                    
                    if (mentorshipResponse.data?.mentorshipId) {
                        const goalsResponse = await axiosInstance.get(`/mentorships/${mentorshipResponse.data.mentorshipId}/goals`);
                        setGoals(goalsResponse.data || []);
                        
                        const meetingsResponse = await axiosInstance.get(`/mentorships/meetings/${authUser._id}`);
                        const menteeMeetings = meetingsResponse.data.filter(m => 
                            m.menteeId === mentee._id || m.mentorId === mentorResponse.data.mentorId
                        );
                        if (menteeMeetings.length > 0) {
                            const lastMeeting = menteeMeetings.reduce((latest, current) => {
                                return new Date(current.date) > new Date(latest.date) ? current : latest;
                            });
                            setLastInteraction(lastMeeting);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching mentee data:", error);
            }
        };
        fetchData();
    }, [authUser?._id, mentee._id]);

    const handleViewGoals = async (e) => {
        e.stopPropagation();
        if (!authUser?._id) return;
        setLoading(true);
        try {
            const mentorResponse = await axiosInstance.get(`/mentorships/find/${authUser._id}`);
            const { data } = await axiosInstance.get(
                `/mentorships/find?mentor=${mentorResponse.data?.mentorId}&mentee=${mentee._id}`
            );
            navigate(data?.mentorshipId 
                ? `/mentorships/${data.mentorshipId}/goals` 
                : `/mentee/${mentee._id}/goals`);
        } catch (error) {
            console.error("Error:", error);
            navigate(`/mentee/${mentee._id}/goals`);
        } finally {
            setLoading(false);
        }
    };

    const handleMessageClick = (e) => {
        e.stopPropagation();
        navigate(`/messages?user=${mentee._id}`);
    };

    const handleScheduleClick = (e) => {
        e.stopPropagation();
        if (mentorId) {
            navigate(`/schedule/${mentorId}`);
        }
    };

    if (!mentee) {
        return (
            <div className="bg-error/10 dark:bg-error-dark/20 p-4 rounded-xl text-error dark:text-error-dark flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Mentee data is missing</span>
            </div>
        );
    }

    const menteeUser = mentee.mentee || mentee.user || mentee;
    const menteeName = menteeUser.name || menteeUser.fullName || "Unknown Name";
    const menteeEmail = menteeUser.email || "No email provided";

    const getStatusConfig = (status) => ({
        active: {
            bg: "bg-success/10 dark:bg-success-dark/20",
            text: "text-success dark:text-success-dark",
            border: "border-success/30 dark:border-success-dark/30",
            icon: <TrendingUp size={14} />,
            description: "Active mentorship",
        },
        pending: {
            bg: "bg-warning/10 dark:bg-warning-dark/20",
            text: "text-warning dark:text-warning-dark",
            border: "border-warning/30 dark:border-warning-dark/30",
            icon: <Clock size={14} />,
            description: "Pending start",
        },
        completed: {
            bg: "bg-info/10 dark:bg-info-dark/20",
            text: "text-info dark:text-info-dark",
            border: "border-info/30 dark:border-info-dark/30",
            icon: <Award size={14} />,
            description: "Completed",
        },
    }[status] || {
        bg: "bg-secondary/10 dark:bg-secondary-dark/20",
        text: "text-secondary dark:text-secondary-dark",
        border: "border-secondary/30 dark:border-secondary-dark/30",
        icon: <Star size={14} />,
        description: "Status unknown",
    });

    const calculateGoalProgress = (goal) => {
        if (!goal?.subgoals?.length) return 0;
        const completed = goal.subgoals.filter(s => s.completed).length;
        return Math.round((completed / goal.subgoals.length) * 100);
    };

    const statusConfig = getStatusConfig(mentee.status);
    const primaryGoal = goals[0];
    const progress = primaryGoal ? calculateGoalProgress(primaryGoal) : 0;

    return (
        <div className={`group relative overflow-hidden rounded-2xl border ${statusConfig.border} bg-card dark:bg-card-dark shadow-sm hover:shadow-md transition-all duration-300`}>
            {/* Content with higher z-index */}
            <div className="relative z-10 p-5">
                {/* Header with avatar and status */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary-dark/20 dark:to-primary-dark/30 flex items-center justify-center">
                            <User size={24} className="text-primary dark:text-primary-dark" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card dark:border-card-dark flex items-center justify-center ${statusConfig.bg}`}>
                            {statusConfig.icon}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-text dark:text-text-dark truncate">
                                {menteeName}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                                {mentee.status || 'unknown'}
                            </span>
                        </div>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted flex items-center gap-2 mt-1">
                            <Mail size={14} />
                            <span className="truncate">{menteeEmail}</span>
                        </p>
                    </div>
                </div>

                {/* Progress section */}
                {primaryGoal && (
                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-text dark:text-text-dark flex items-center gap-2">
                                <Bookmark size={14} className="text-accent dark:text-accent-dark" />
                                Current Goal
                            </h4>
                            <span className="text-xs font-medium text-text dark:text-text-dark">
                                {progress}%
                            </span>
                        </div>
                        <div className="relative h-2 w-full rounded-full bg-secondary/20 dark:bg-secondary-dark/20 overflow-hidden">
                            <div 
                                className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-accent to-accent-dark transition-all duration-500`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted mt-2 line-clamp-2">
                            {primaryGoal.text}
                        </p>
                    </div>
                )}

                {/* Last interaction */}
                {lastInteraction && (
                    <div className="flex items-center gap-2 text-xs text-text-muted dark:text-text-dark-muted mb-5">
                        <Clock size={12} />
                        <span>Last interaction: {format(new Date(lastInteraction.date), 'MMM d, yyyy')}</span>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleViewGoals}
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${loading 
                            ? 'bg-secondary/20 dark:bg-secondary-dark/20 text-text-muted dark:text-text-dark-muted' 
                            : 'bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark hover:bg-primary/20 dark:hover:bg-primary-dark/20'}`}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Target size={16} />
                        )}
                        <span className="text-sm font-medium">Goals</span>
                    </button>

                    <button
                        onClick={handleMessageClick}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary/10 dark:bg-secondary-dark/10 text-text dark:text-text-dark rounded-lg hover:bg-secondary/20 dark:hover:bg-secondary-dark/20 transition-all"
                    >
                        <MessageCircle size={16} className="text-text dark:text-text-dark" />
                        <span className="text-sm font-medium">Chat</span>
                    </button>

                    <button
                        onClick={handleScheduleClick}
                        disabled={!mentorId}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${!mentorId 
                            ? 'bg-secondary/20 dark:bg-secondary-dark/20 text-text-muted dark:text-text-dark-muted' 
                            : 'bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark hover:bg-accent/20 dark:hover:bg-accent-dark/20'}`}
                    >
                        <Calendar size={16} />
                        <span className="text-sm font-medium">Meet</span>
                    </button>
                </div>
            </div>

            {/* Glow effect with lower z-index */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-0
                ${mentee.status === 'active' ? 'from-success/20 to-transparent' :
                  mentee.status === 'pending' ? 'from-warning/20 to-transparent' :
                  'from-info/20 to-transparent'}`}
            />
        </div>
    );
};

export default MenteeCard;