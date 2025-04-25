import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import {
  Plus,
  Check,
  X,
  CheckCircle,
  Target,
  Loader2,
  AlertTriangle,
  Flag,
} from "lucide-react";

const fetchGoals = async (mentorshipId) => {
  if (!mentorshipId) return [];
  const { data } = await axiosInstance.get(`/mentorships/${mentorshipId}/goals`);
  return data;
};

const GoalsPage = ({ userRole }) => {
  const { mentorshipId } = useParams();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState("");
  const [subgoalText, setSubgoalText] = useState({});

  const { data: goals = [], isLoading, isError } = useQuery({
    queryKey: ["goals", mentorshipId],
    queryFn: () => fetchGoals(mentorshipId),
    enabled: !!mentorshipId,
  });

  const addGoalMutation = useMutation({
    mutationFn: async (text) => {
      if (!mentorshipId || !text.trim()) return;
      await axiosInstance.post(`/mentorships/${mentorshipId}/goals`, {
        text,
        setBy: "mentee",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", mentorshipId]);
      setNewGoal("");
    },
    onError: (error) => console.error("Error adding goal:", error),
  });

  const addSubgoalMutation = useMutation({
    mutationFn: async ({ goalId, subgoalText }) => {
      if (!mentorshipId || !goalId || !subgoalText.trim()) return;
      await axiosInstance.post(`/mentorships/${mentorshipId}/goals/${goalId}/subgoals`, {
        text: subgoalText,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", mentorshipId]);
      setSubgoalText({});
    },
    onError: (error) => console.error("Error adding subgoal:", error),
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId) => {
      await axiosInstance.delete(`/mentorships/${mentorshipId}/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", mentorshipId]);
    },
    onError: (error) => console.error("Error deleting goal:", error),
  });

  const deleteSubgoalMutation = useMutation({
    mutationFn: async ({ goalId, subgoalId }) => {
      await axiosInstance.delete(`/mentorships/${mentorshipId}/goals/${goalId}/subgoals/${subgoalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", mentorshipId]);
    },
    onError: (error) => console.error("Error deleting subgoal:", error),
  });

  const markGoalCompletedMutation = useMutation({
    mutationFn: async (goalId) => {
      await axiosInstance.put(`/mentorships/goals/${goalId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", mentorshipId]);
    },
    onError: (error) => console.error("Error marking goal as completed:", error),
  });

  const markSubgoalCompletedMutation = useMutation({
    mutationFn: async ({ goalId, subgoalId }) => {
      await axiosInstance.put(`/mentorships/goals/${goalId}/subgoals/${subgoalId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals", mentorshipId]);
    },
    onError: (error) => console.error("Error marking subgoal as completed:", error),
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-white dark:bg-[#1A1A1A]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary dark:text-primary-dark mx-auto" />
          <p className="mt-4 text-muted dark:text-muted-dark">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-white dark:bg-[#1A1A1A]">
        <div className="text-center">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            Error Loading Goals
          </h3>
          <p className="text-muted dark:text-muted-dark mb-4">
            Unable to fetch your goals. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark rounded-lg hover:bg-primary/20 dark:hover:bg-primary-dark/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A1A1A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text dark:text-text-dark">
            Goals & Progress
          </h2>
          <p className="text-muted dark:text-muted-dark mt-1">
            Track and manage your mentorship goals
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a new goal..."
              className="flex-1 px-4 py-2.5 bg-white dark:bg-card-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all"
            />
            <button
              onClick={() => addGoalMutation.mutate(newGoal)}
              disabled={!newGoal.trim()}
              className="px-4 py-2.5 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1A1A1A]">
            <Target size={48} className="text-muted dark:text-muted-dark mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
              No Goals Set
            </h3>
            <p className="text-muted dark:text-muted-dark">
              Start by adding your first goal above
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => {
              const totalSubgoals = goal.subgoals.length;
              const completedSubgoals = goal.subgoals.filter((s) => s.completed).length;
              const progress = totalSubgoals > 0 ? (completedSubgoals / totalSubgoals) * 100 : goal.completed ? 100 : 0;

              return (
                <div 
                  key={goal._id} 
                  className={`bg-white dark:bg-card-dark rounded-lg shadow-sm p-6 ${goal.completed ? 'ring-1 ring-emerald-200 dark:ring-emerald-800/50' : 'ring-1 ring-border dark:ring-border-dark'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${goal.completed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-primary/10 dark:bg-primary-dark/10'}`}>
                        <Flag size={20} className={goal.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary dark:text-primary-dark'} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${goal.completed ? 'text-muted dark:text-muted-dark line-through' : 'text-text dark:text-text-dark'}`}>
                          {goal.text}
                        </h3>
                        <p className="text-sm text-muted dark:text-muted-dark">
                          Set by {goal.setBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {goal.completed ? (
                        <CheckCircle size={20} className="text-emerald-500 dark:text-emerald-400" />
                      ) : userRole !== 'alumni' && (
                        <button 
                          onClick={() => markGoalCompletedMutation.mutate(goal._id)} 
                          className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors"
                        >
                          <Check size={20} className="text-emerald-500 dark:text-emerald-400" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteGoalMutation.mutate(goal._id)} 
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <X size={20} className="text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted dark:text-muted-dark">
                        Progress
                      </p>
                      <p className="text-sm font-medium text-text dark:text-text-dark">
                        {progress.toFixed(0)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${goal.completed ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-primary dark:bg-primary-dark'}`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {goal.subgoals.map((subgoal) => (
                      <div 
                        key={subgoal._id} 
                        className={`flex items-center justify-between p-3 rounded-lg ${subgoal.completed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}
                      >
                        <div className={`text-sm ${subgoal.completed ? 'line-through text-muted dark:text-muted-dark' : 'text-text dark:text-text-dark'}`}>
                          {subgoal.text}
                        </div>
                        <div className="flex items-center gap-2">
                          {!subgoal.completed && userRole !== 'alumni' && (
                            <button 
                              onClick={() => markSubgoalCompletedMutation.mutate({ goalId: goal._id, subgoalId: subgoal._id })} 
                              className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors"
                            >
                              <Check size={18} className="text-emerald-500 dark:text-emerald-400" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteSubgoalMutation.mutate({ goalId: goal._id, subgoalId: subgoal._id })} 
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          >
                            <X size={18} className="text-red-500 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <input
                      type="text"
                      value={subgoalText[goal._id] || ""}
                      onChange={(e) => setSubgoalText({ ...subgoalText, [goal._id]: e.target.value })}
                      placeholder="Add a subgoal..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-card-dark border border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20"
                    />
                    <button
                      onClick={() => addSubgoalMutation.mutate({ goalId: goal._id, subgoalText: subgoalText[goal._id] })}
                      disabled={!subgoalText[goal._id]?.trim()}
                      className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;