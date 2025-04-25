import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "../../context/ThemeContext";
import { axiosInstance } from "../../lib/axios";
import { MessageSquare, ThumbsUp, ThumbsDown, Send, Image, Video, X } from "lucide-react";
import { toast } from "react-hot-toast";

const DiscussionDetailPage = () => {
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const [answerContent, setAnswerContent] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/me");
      return response.data;
    },
  });

  const { data: discussion, isLoading } = useQuery({
    queryKey: ["discussion", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/discussions/${id}`);
      return response.data;
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ type }) => {
      try {
        await axiosInstance.post(`/discussions/${id}/vote`, { type });
        toast.success(`Successfully ${type}d the discussion`);
      } catch (error) {
        console.error("Error voting:", error);
        toast.error(error.response?.data?.message || "Failed to vote");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", id]);
    },
  });

  const answerVoteMutation = useMutation({
    mutationFn: async ({ answerId, type }) => {
      try {
        await axiosInstance.post(`/discussions/${id}/answers/${answerId}/vote`, { type });
        toast.success(`Successfully ${type}d the answer`);
      } catch (error) {
        console.error("Error voting:", error);
        toast.error(error.response?.data?.message || "Failed to vote");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", id]);
    },
  });

  const addAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!answerContent.trim()) {
        throw new Error("Answer content is required");
      }

      const formData = new FormData();
      formData.append("content", answerContent.trim());
      formData.append("authorName", currentUser?.name || "Anonymous");
      if (media) {
        formData.append("file", media);
      }
      
      try {
        await axiosInstance.post(`/discussions/${id}/answers`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Answer posted successfully!");
      } catch (error) {
        console.error("Error posting answer:", error);
        toast.error(error.response?.data?.message || "Failed to post answer");
        throw error;
      }
    },
    onSuccess: () => {
      setAnswerContent("");
      setMedia(null);
      setMediaPreview(null);
      queryClient.invalidateQueries(["discussion", id]);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size should be less than 10MB");
        return;
      }
      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    addAnswerMutation.mutate();
  };

  const getVoteStatus = (upvotes, downvotes, userId) => {
    if (!userId) return { upvoted: false, downvoted: false };
    return {
      upvoted: upvotes.includes(userId),
      downvoted: downvotes.includes(userId),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const discussionVoteStatus = getVoteStatus(
    discussion.upvotes || [],
    discussion.downvotes || [],
    currentUser?._id
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-background-dark" : "bg-background"}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Discussion Header */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? "bg-card-dark border-border-dark" : "bg-card border-border"
        } mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            {discussion.author?.profilePicture ? (
              <img
                src={discussion.author.profilePicture}
                alt={discussion.author.name || discussion.authorName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-primary">
                <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {(discussion.author?.name || discussion.authorName || 'A')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className={`font-medium ${isDarkMode ? "text-text-dark" : "text-text"}`}>
                {discussion.author?.name || discussion.authorName}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <h1 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? "text-text-dark" : "text-text"
          }`}>
            {discussion.title}
          </h1>

          <p className={`mb-6 whitespace-pre-wrap ${
            isDarkMode ? "text-text-dark/80" : "text-text/80"
          }`}>
            {discussion.content}
          </p>

          {discussion.image && (
            <div className="mb-6">
              {discussion.image.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={discussion.image}
                  alt="Discussion"
                  className="max-h-96 rounded-lg object-contain"
                  onError={(e) => {
                    console.error("Image failed to load:", e);
                    e.target.style.display = 'none';
                  }}
                />
              ) : discussion.image.match(/\.(mp4|webm)$/i) ? (
                <video
                  src={discussion.image}
                  controls
                  className="max-h-96 rounded-lg w-full"
                  onError={(e) => {
                    console.error("Video failed to load:", e);
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => voteMutation.mutate({ type: "upvote" })}
                disabled={voteMutation.isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                } ${discussionVoteStatus.upvoted ? "text-primary" : "text-gray-500"}`}
              >
                <ThumbsUp size={20} />
              </button>
              <span className="text-gray-500 min-w-[20px] text-center">
                {discussion.upvotes?.length - discussion.downvotes?.length || 0}
              </span>
              <button
                onClick={() => voteMutation.mutate({ type: "downvote" })}
                disabled={voteMutation.isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                } ${discussionVoteStatus.downvoted ? "text-red-500" : "text-gray-500"}`}
              >
                <ThumbsDown size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-gray-500" />
              <span className="text-gray-500">{discussion.answers?.length || 0} Answers</span>
            </div>
          </div>
        </div>

        {/* Answer Form */}
        <div className={`p-6 rounded-lg border mb-6 ${
          isDarkMode ? "bg-card-dark border-border-dark" : "bg-card border-border"
        }`}>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div className="flex gap-4">
              {currentUser?.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.name || "Anonymous"}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-primary">
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {(currentUser?.name || 'A')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="mb-2">
                  <span className={`font-medium ${isDarkMode ? "text-text-dark" : "text-text"}`}>
                    {currentUser?.name || "Anonymous"}
                  </span>
                </div>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Write your answer..."
                  rows={4}
                  className={`w-full p-3 rounded-lg mb-4 ${
                    isDarkMode
                      ? "bg-secondary-dark text-text-dark placeholder-gray-400"
                      : "bg-secondary text-text placeholder-gray-500"
                  } focus:outline-none resize-none`}
                />

                {mediaPreview && (
                  <div className="relative mb-4">
                    {media?.type?.startsWith('image/') ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-64 rounded-lg object-contain"
                      />
                    ) : media?.type?.startsWith('video/') ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-h-64 rounded-lg w-full"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setMedia(null);
                        setMediaPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-gray-800/50 hover:bg-gray-800/75"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                      }`}
                    >
                      <Image size={20} className="text-gray-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                      }`}
                    >
                      <Video size={20} className="text-gray-500" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!answerContent.trim() || addAnswerMutation.isLoading}
                    className={`px-6 py-2 rounded-full flex items-center gap-2 transition-colors ${
                      isDarkMode
                        ? "bg-primary-dark text-white hover:bg-primary-dark/90"
                        : "bg-primary text-white hover:bg-primary/90"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Send size={16} />
                    {addAnswerMutation.isLoading ? "Posting..." : "Post Answer"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Answers List */}
        <div className="space-y-6">
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? "text-text-dark" : "text-text"
          }`}>
            {discussion.answers?.length || 0} Answers
          </h2>
          {discussion.answers?.map((answer) => {
            const answerVoteStatus = getVoteStatus(
              answer.upvotes || [],
              answer.downvotes || [],
              currentUser?._id
            );

            return (
              <div
                key={answer._id}
                className={`p-6 rounded-lg border ${
                  isDarkMode ? "bg-card-dark border-border-dark" : "bg-card border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {answer.author?.profilePicture ? (
                    <img
                      src={answer.author.profilePicture}
                      alt={answer.author.name || answer.authorName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-primary">
                      <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        {(answer.author?.name || answer.authorName || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className={`font-medium ${isDarkMode ? "text-text-dark" : "text-text"}`}>
                      {answer.author?.name || answer.authorName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <p className={`mb-4 whitespace-pre-wrap ${
                  isDarkMode ? "text-text-dark/80" : "text-text/80"
                }`}>
                  {answer.content}
                </p>

                {answer.image && (
                  <div className="mb-4">
                    {answer.image.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={answer.image}
                        alt="Answer"
                        className="max-h-96 rounded-lg object-contain"
                        onError={(e) => {
                          console.error("Image failed to load:", e);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : answer.image.match(/\.(mp4|webm)$/i) ? (
                      <video
                        src={answer.image}
                        controls
                        className="max-h-96 rounded-lg w-full"
                        onError={(e) => {
                          console.error("Video failed to load:", e);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => answerVoteMutation.mutate({
                        answerId: answer._id,
                        type: "upvote"
                      })}
                      disabled={answerVoteMutation.isLoading}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                      } ${answerVoteStatus.upvoted ? "text-primary" : "text-gray-500"}`}
                    >
                      <ThumbsUp size={20} />
                    </button>
                    <span className="text-gray-500 min-w-[20px] text-center">
                      {answer.upvotes?.length - answer.downvotes?.length || 0}
                    </span>
                    <button
                      onClick={() => answerVoteMutation.mutate({
                        answerId: answer._id,
                        type: "downvote"
                      })}
                      disabled={answerVoteMutation.isLoading}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                      } ${answerVoteStatus.downvoted ? "text-red-500" : "text-gray-500"}`}
                    >
                      <ThumbsDown size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetailPage; 