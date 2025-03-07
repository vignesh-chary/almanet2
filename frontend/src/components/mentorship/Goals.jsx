import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Calendar, X, Plus, Check, CheckCircle } from "lucide-react";

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

  if (isLoading) return <p>Loading goals...</p>;
  if (isError) return <p>Error fetching goals.</p>;

  return (
    <div className="relative flex min-h-screen flex-col bg-white overflow-x-hidden font-manrope">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between border-b px-10 py-3">
          <h2 className="text-lg font-bold">Goals</h2>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-2xl font-bold px-4 pt-6 pb-3">Set Your Goals</h1>
            <p className="text-base px-4 pb-3">Set goals to get the most out of your mentorship.</p>

            {goals.length === 0 ? (
              <p className="text-center text-gray-500">No goals set yet. Add a new goal below!</p>
            ) : (
              goals.map((goal) => {
                const totalSubgoals = goal.subgoals.length;
                const completedSubgoals = goal.subgoals.filter((subgoal) => subgoal.completed).length;
                const progress = totalSubgoals > 0 ? (completedSubgoals / totalSubgoals) * 100 : goal.completed ? 100 : 0;

                return (
                  <div
                    key={goal._id}
                    className={`bg-white px-4 py-2 shadow-md rounded-lg mb-4 ${
                      goal.completed ? "border-l-4 border-green-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-200 p-3 rounded-lg">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              goal.completed ? "line-through text-gray-500" : "text-gray-900"
                            }`}
                          >
                            {goal.text}
                          </p>
                          <p className="text-sm text-gray-600">Set by {goal.setBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.completed ? (
                          <CheckCircle size={24} className="text-green-500" />
                        ) : userRole !== 'alumni' && (
                          <button
                            onClick={() => markGoalCompletedMutation.mutate(goal._id)}
                            className="text-green-500 hover:text-green-700"
                          >
                            <Check size={24} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteGoalMutation.mutate(goal._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>

                    {/* Subgoals */}
                    <div className="ml-10 mt-3">
                      {goal.subgoals?.map((subgoal) => (
                        <div
                          key={subgoal._id}
                          className={`flex items-center justify-between p-2 bg-gray-100 rounded-lg mb-2 ${
                            subgoal.completed ? "border-l-4 border-green-500" : ""
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              subgoal.completed ? "line-through text-gray-500" : "text-gray-900"
                            }`}
                          >
                            {subgoal.text}
                          </p>
                          <div className="flex items-center gap-2">
                            {subgoal.completed ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : userRole !== 'alumni' && (
                              <button
                                onClick={() =>
                                  markSubgoalCompletedMutation.mutate({ goalId: goal._id, subgoalId: subgoal._id })
                                }
                                className="text-green-500 hover:text-green-700"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteSubgoalMutation.mutate({ goalId: goal._id, subgoalId: subgoal._id })
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={subgoalText[goal._id] || ""}
                          onChange={(e) => setSubgoalText({ ...subgoalText, [goal._id]: e.target.value })}
                          placeholder="Add a subgoal"
                          className="rounded-lg px-3 py-1 border focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() =>
                            addSubgoalMutation.mutate({ goalId: goal._id, subgoalText: subgoalText[goal._id] || "" })
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="ml-10 mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}% completed</p>
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex px-4 py-3">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new goal"
                className="rounded-lg px-3 py-2 border flex-1 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => addGoalMutation.mutate(newGoal)}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;