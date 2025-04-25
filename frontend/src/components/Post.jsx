import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loader, Heart, MessageSquare, Send, Bookmark, MoreVertical, Trash2, FileText, Video, Image as ImageIcon, Maximize2, Share2, Shield, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ContentModeration from "./ContentModeration";

const Post = ({ post }) => {
    const { postId } = useParams();
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [isChecking, setIsChecking] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showModerationMenu, setShowModerationMenu] = useState(false);

    const isOwner = authUser?._id === post?.author?._id;
    const isLiked = post?.likes?.includes(authUser?._id);
    const isAdmin = authUser?.role === 'admin';

    const isVideo = post.image?.includes('.mp4') || post.image?.includes('.mov');
    const isPdf = post.image?.includes('.pdf');
    const isImage = post.image && !isVideo && !isPdf;

    const checkContent = async (content) => {
        try {
            const response = await axiosInstance.post("/moderation/test-moderation", { content });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data || error.message };
        }
    };

    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete(`/posts/delete/${post._id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post deleted successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete post");
        },
    });

    const { mutate: addComment, isPending: isCommenting } = useMutation({
        mutationFn: async (content) => {
            const response = await axiosInstance.post(`/posts/${post._id}/comment`, { content });
            return response.data.comment;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            setNewComment("");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to add comment");
        }
    });

    const { mutate: likePost } = useMutation({
        mutationFn: async () => {
            await axiosInstance.post(`/posts/${post._id}/like`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
        }
    });

    const handleDeletePost = () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        deletePost();
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        try {
            setIsChecking(true);
            const moderationResult = await checkContent(newComment);
            
            if (!moderationResult.success) {
                toast.error(moderationResult.error.message || "Comment failed moderation check");
                return;
            }

            addComment(newComment);
            setComments([...comments, {
                content: newComment,
                user: {
                    _id: authUser._id,
                    name: authUser.name,
                    profilePicture: authUser.profilePicture,
                },
                createdAt: new Date(),
            }]);
        } catch (error) {
            console.error('Error in handleAddComment:', error);
            toast.error("Error checking content");
        } finally {
            setIsChecking(false);
        }
    };

    const handleModerationComplete = (updatedPost) => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
    };

    const getMediaType = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
        if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
        if (['pdf'].includes(extension)) return 'pdf';
        return 'unknown';
    };

    const handleVideoClick = (e) => {
        e.preventDefault();
        const video = e.target;
        if (isVideoPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsVideoPlaying(!isVideoPlaying);
    };

    const renderMedia = () => {
        if (!post.image) return null;

        if (isVideo) {
            return (
                <div className="relative mt-2">
                    <video
                        src={post.image}
                        controls
                        className="w-full rounded-lg border border-[#E9DFCE] max-h-[500px] object-contain"
                        onClick={handleVideoClick}
                    />
                </div>
            );
        }

        if (isPdf) {
            return (
                <div className="mt-2 relative">
                    <div className="w-full rounded-lg border border-[#E9DFCE] bg-[#F9F6F0] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="text-[#A18249]" size={24} />
                            <span className="text-[#1C160C] font-medium">PDF Document</span>
                        </div>
                        <div className="flex justify-center items-center h-40">
                            <div className="text-center">
                                <FileText className="text-[#A18249] mx-auto mb-2" size={40} />
                                <p className="text-[#1C160C] text-sm">PDF Document</p>
                                <a 
                                    href={post.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#019863] text-sm hover:underline mt-2 inline-block"
                                >
                                    View PDF
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-2 relative">
                <img
                    src={post.image}
                    alt="Post content"
                    className="w-full rounded-lg border border-[#E9DFCE] max-h-[500px] object-contain"
                />
            </div>
        );
    };

    const renderContent = () => {
        if (!post.content) return null;

        const content = post.content;
        const shouldShowReadMore = content.length > 200;

        return (
            <div className="mt-2">
                {shouldShowReadMore ? (
                    <>
                        <p className="text-[#1C160C] text-sm">
                            {showFullContent ? content : `${content.substring(0, 200)}...`}
                        </p>
                        <button
                            onClick={() => setShowFullContent(!showFullContent)}
                            className="text-[#019863] text-sm hover:underline mt-1"
                        >
                            {showFullContent ? "Show less" : "Read more"}
                        </button>
                    </>
                ) : (
                    <p className="text-[#1C160C] text-sm">{content}</p>
                )}
            </div>
        );
    };

    // Full screen video modal
    const VideoModal = () => {
        if (!isFullScreen) return null;

        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                    <video
                        src={post.image}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    />
                    <button
                        onClick={() => setIsFullScreen(false)}
                        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <Maximize2 size={24} className="rotate-180" />
                    </button>
                </div>
            </div>
        );
    };

    const handleModeration = async () => {
        try {
            const response = await axiosInstance.post(`/moderation/posts/${post._id}/moderate`);
            if (response.data.success) {
                queryClient.invalidateQueries({ queryKey: ["posts"] });
                toast.success("Post moderated successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to moderate post");
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-card-dark rounded-lg border border-border dark:border-border-dark transition-colors duration-200">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.author.username}`} className="flex-shrink-0">
                        <img
                            src={post.author.profilePicture || "/avatar.png"}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </Link>
                    <div>
                        <Link 
                            to={`/profile/${post.author.username}`}
                            className="font-bold text-text dark:text-text-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
                        >
                            {post.author.name}
                        </Link>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <ContentModeration 
                            postId={post._id} 
                            onModerationComplete={handleModerationComplete}
                        />
                    )}
                    {isOwner && (
                        <button
                            onClick={() => setShowModerationMenu(!showModerationMenu)}
                            className="p-1.5 rounded-full hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
                        >
                            <MoreVertical size={20} className="text-text dark:text-text-dark" />
                        </button>
                    )}
                    {showModerationMenu && (
                        <div className="absolute right-4 mt-8 bg-white dark:bg-card-dark rounded-lg shadow-lg border border-border dark:border-border-dark py-1 z-10">
                            <button
                                onClick={handleDeletePost}
                                className="flex items-center gap-2 px-4 py-2 text-error dark:text-error-dark hover:bg-error/10 dark:hover:bg-error-dark/10 w-full text-left"
                            >
                                <Trash2 size={16} />
                                <span>Delete Post</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
                <p className="text-text dark:text-text-dark whitespace-pre-wrap break-words">{post.content}</p>
            </div>

            {/* Post Media */}
            {post.image && (
                <div className="mb-4 rounded-lg overflow-hidden">
                    {renderMedia()}
                </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
                <div className="flex items-center gap-4">
                    <button
                        onClick={likePost}
                        className={`flex items-center gap-1.5 p-1.5 rounded-full transition-colors ${
                            isLiked ? "text-primary dark:text-primary-dark" : "text-text dark:text-text-dark hover:bg-secondary dark:hover:bg-secondary-dark"
                        }`}
                    >
                        <Heart size={18} className={isLiked ? "fill-current" : ""} />
                        <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 p-1.5 rounded-full text-text dark:text-text-dark hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
                    >
                        <MessageSquare size={18} />
                        <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">
                    <div className="flex items-start gap-3 mb-4">
                        <img
                            src={authUser?.profilePicture || "/avatar.png"}
                            alt={authUser?.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-3 py-2 rounded-full border border-border dark:border-border-dark bg-white dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || isCommenting || isChecking}
                                    className="bg-primary dark:bg-primary-dark text-white p-2 rounded-full hover:bg-primary-dark dark:hover:bg-primary transition-colors disabled:opacity-50"
                                >
                                    {isCommenting || isChecking ? (
                                        <Loader className="animate-spin" size={16} />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {post.comments?.map((comment) => (
                            <div key={comment._id} className="flex items-start gap-3">
                                <Link to={`/profile/${comment.user.username}`}>
                                    <img
                                        src={comment.user.profilePicture || "/avatar.png"}
                                        alt={comment.user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                </Link>
                                <div className="flex-1">
                                    <div className="bg-secondary dark:bg-secondary-dark rounded-2xl px-4 py-2">
                                        <Link 
                                            to={`/profile/${comment.user.username}`}
                                            className="font-bold text-text dark:text-text-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
                                        >
                                            {comment.user.name}
                                        </Link>
                                        <p className="text-text dark:text-text-dark whitespace-pre-wrap break-words">{comment.content}</p>
                                    </div>
                                    <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Video Modal */}
            {isFullScreen && post.image && getMediaType(post.image) === 'video' && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl">
                        <button
                            onClick={() => setIsFullScreen(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                        <video
                            src={post.image}
                            controls
                            autoPlay
                            className="w-full rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Post;