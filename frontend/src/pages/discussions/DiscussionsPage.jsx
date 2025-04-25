import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { axiosInstance } from "../../lib/axios";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp, ThumbsDown, X, Image, Video, Paperclip, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";

const DiscussionsPage = () => {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/me");
      return response.data;
    },
  });

  const { data: discussions, isLoading } = useQuery({
    queryKey: ["discussions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/discussions");
      console.log("Fetched discussions with authors:", response.data.discussions.map(d => ({
        id: d._id,
        author: d.author,
        authorName: d.authorName
      })));
      return response.data.discussions;
    },
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !content.trim()) {
        throw new Error("Title and content are required");
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("authorName", currentUser?.name || "Anonymous");
      
      if (media) {
        formData.append("file", media);
      }

      try {
        const response = await axiosInstance.post("/discussions", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Discussion created successfully!");
        return response.data;
      } catch (error) {
        console.error("Error creating discussion:", error);
        toast.error(error.response?.data?.message || error.message || "Failed to create discussion");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      setIsAskingQuestion(false);
      setTitle("");
      setContent("");
      setMedia(null);
      setMediaPreview(null);
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

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    createDiscussionMutation.mutate();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className={`flex-1 pl-4 lg:pl-80 ${isDarkMode ? "bg-background-dark" : "bg-background"}`}>
        {/* Header Section */}
        <div className={`border-b ${isDarkMode ? "border-border-dark" : "border-border"}`}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            {!isAskingQuestion ? (
              <>
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isDarkMode ? "hover:bg-card-dark/50" : "hover:bg-card/50"
                  }`}
                  onClick={() => setIsAskingQuestion(true)}
                >
                  <div className="relative">
                    <img
                      src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.name || 'Anonymous'}&background=random`}
                      alt={currentUser?.name || "User"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div className={`flex-1 p-4 rounded-2xl border ${
                    isDarkMode 
                      ? "bg-secondary-dark/50 border-border-dark text-text-dark" 
                      : "bg-secondary/50 border-border text-text"
                  }`}>
                    <span className="text-gray-500">What's on your mind?</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 px-4">
                  <button
                    onClick={() => setIsAskingQuestion(true)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? "hover:bg-card-dark text-primary-dark" 
                        : "hover:bg-card text-primary"
                    }`}
                  >
                    <MessageSquare size={22} /> Ask a Question
                  </button>
                </div>
              </>
            ) : (
              <div className={`p-6 rounded-xl border ${
                isDarkMode ? "bg-card-dark border-border-dark" : "bg-card border-border"
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-xl font-semibold ${
                    isDarkMode ? "text-text-dark" : "text-text"
                  }`}>
                    Create a Discussion
                  </h2>
                  <button
                    onClick={() => {
                      setIsAskingQuestion(false);
                      setMedia(null);
                      setMediaPreview(null);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleSubmitQuestion} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.name || 'Anonymous'}&background=random`}
                        alt={currentUser?.name || "User"}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <p className={`font-medium ${isDarkMode ? "text-text-dark" : "text-text"}`}>
                      {currentUser?.name || "Anonymous"}
                    </p>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your question title"
                      className={`w-full p-4 rounded-xl text-lg ${
                        isDarkMode
                          ? "bg-secondary-dark text-text-dark placeholder-gray-400"
                          : "bg-secondary text-text placeholder-gray-500"
                      } focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200`}
                    />
                  </div>
                  <div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Provide more details about your question..."
                      rows={4}
                      className={`w-full p-4 rounded-xl text-base ${
                        isDarkMode
                          ? "bg-secondary-dark text-text-dark placeholder-gray-400"
                          : "bg-secondary text-text placeholder-gray-500"
                      } focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200`}
                    />
                  </div>

                  {mediaPreview && (
                    <div className="relative group">
                      {media?.type?.startsWith('image/') ? (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-h-96 w-full rounded-xl object-cover"
                        />
                      ) : media?.type?.startsWith('video/') ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="max-h-96 w-full rounded-xl"
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          setMedia(null);
                          setMediaPreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-gray-800/50 hover:bg-gray-800/75 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
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
                        className={`p-3 rounded-xl transition-all duration-200 ${
                          isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                        }`}
                      >
                        <Image size={22} className="text-gray-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-xl transition-all duration-200 ${
                          isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                        }`}
                      >
                        <Video size={22} className="text-gray-500" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={createDiscussionMutation.isLoading || !title.trim() || !content.trim()}
                      className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-primary-dark text-white hover:bg-primary-dark/90"
                          : "bg-primary text-white hover:bg-primary/90"
                      } disabled:opacity-50`}
                    >
                      {createDiscussionMutation.isLoading ? (
                        "Posting..."
                      ) : (
                        <>
                          <Send size={20} />
                          Post Question
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Discussions List */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {discussions?.map((discussion) => (
                <div
                  key={discussion._id}
                  className={`p-6 rounded-xl border ${
                    isDarkMode ? "bg-card-dark border-border-dark" : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      {console.log("Rendering discussion author:", discussion.author)}
                      {discussion.author?.profilePicture ? (
                        <img
                          src={discussion.author.profilePicture}
                          alt={discussion.author.name || discussion.authorName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                          onError={(e) => {
                            console.error("Error loading profile picture:", e);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-primary">
                          <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            {(discussion.author?.name || discussion.authorName || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        discussion.author?.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}></div>
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? "text-text-dark" : "text-text"}`}>
                        {discussion.author?.name || discussion.authorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <Link to={`/discussions/${discussion._id}`} className="block">
                    <h2 className={`text-xl font-semibold mb-3 ${
                      isDarkMode ? "text-text-dark hover:text-primary-dark" : "text-text hover:text-primary"
                    } transition-colors`}>
                      {discussion.title}
                    </h2>
                    <p className={`mb-4 line-clamp-3 ${
                      isDarkMode ? "text-text-dark/80" : "text-text/80"
                    }`}>
                      {discussion.content}
                    </p>
                    {discussion.image && (
                      <div className="mb-6 rounded-xl overflow-hidden">
                        {discussion.image.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={discussion.image}
                            alt="Discussion"
                            className="w-full h-96 object-cover"
                            onError={(e) => {
                              console.error("Image failed to load:", e);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : discussion.image.match(/\.(mp4|webm)$/i) ? (
                          <video
                            src={discussion.image}
                            controls
                            className="w-full h-96"
                            onError={(e) => {
                              console.error("Video failed to load:", e);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>
                    )}
                  </Link>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-medium ${
                        isDarkMode ? "text-text-dark" : "text-text"
                      }`}>
                        {discussion.upvotes?.length - discussion.downvotes?.length || 0}
                      </span>
                      <span className="text-gray-500">votes</span>
                    </div>
                    <Link
                      to={`/discussions/${discussion._id}`}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                        isDarkMode ? "hover:bg-secondary-dark" : "hover:bg-secondary"
                      }`}
                    >
                      <MessageSquare size={20} className="text-gray-500" />
                      <span className="text-gray-500">{discussion.answers?.length || 0} Answers</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionsPage; 