import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader, Smile, Calendar, BarChart, GripVertical, X, FileText, Video } from "lucide-react";

const PostCreation = ({ user }) => {
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const queryClient = useQueryClient();

    // const checkContent = async (content) => {
    //     try {
    //         const response = await axiosInstance.post("/moderation/test-moderation", { content });
    //         return { success: true, data: response.data };
    //     } catch (error) {
    //         return { success: false, error: error.response?.data || error.message };
    //     }
    // };

    const { mutate: createPost, isPending } = useMutation({
        mutationFn: async (formData) => {
            const response = await axiosInstance.post("/posts/create", formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Post created successfully:', data);
            setContent("");
            setImageFile(null);
            setImagePreview(null);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post created successfully");
        },
        onError: (error) => {
            console.error('Post creation error:', error);
            toast.error(error.response?.data?.message || "Failed to create post");
        },
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const fileType = file.type;
            const isImage = fileType.startsWith('image/');
            const isVideo = fileType.startsWith('video/');
            const isPDF = fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

            if (!isImage && !isVideo && !isPDF) {
                toast.error('Please upload an image, video, or PDF file');
                e.target.value = ''; // Reset the input
                return;
            }

            // Validate file size (10MB limit for images, 50MB for videos, 5MB for PDFs)
            const maxSize = isImage ? 10 * 1024 * 1024 : isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error(`File size should be less than ${maxSize / (1024 * 1024)}MB`);
                e.target.value = ''; // Reset the input
                return;
            }
            
            // For PDFs, create a preview URL
            if (isPDF) {
                const pdfUrl = URL.createObjectURL(file);
                setImageFile(file);
                setImagePreview(pdfUrl);
                return;
            }
            
            // Create a new FileReader instance for each upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setImageFile(file);
            };
            reader.onerror = () => {
                toast.error('Error reading file');
                e.target.value = ''; // Reset the input
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !imageFile) {
            toast.error("Please add some content or a file to your post");
            return;
        }

        try {
            // setIsChecking(true);
            // const moderationResult = await checkContent(content);
            
            // if (!moderationResult.success) {
            //     toast.error(moderationResult.error.message || "Content failed moderation check");
            //     return;
            // }

            const formData = new FormData();
            if (content.trim()) {
                formData.append("content", content.trim());
            }
            if (imageFile) {
                formData.append("image", imageFile);
            }

            createPost(formData);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error("Error checking content");
        } finally {
            setIsChecking(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const renderMediaPreview = () => {
        if (!imageFile && !imagePreview) return null;

        const fileType = imageFile?.type;
        const isImage = fileType?.startsWith('image/');
        const isVideo = fileType?.startsWith('video/');
        const isPDF = fileType === 'application/pdf' || imageFile?.name.toLowerCase().endsWith('.pdf');

        return (
            <div className="mt-2 relative">
                {isImage && imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full rounded-lg border border-[#E9DFCE] dark:border-border-dark max-h-[300px] object-contain"
                    />
                )}
                {isVideo && imagePreview && (
                    <video
                        src={imagePreview}
                        controls
                        className="w-full rounded-lg border border-[#E9DFCE] dark:border-border-dark max-h-[300px] object-contain"
                    />
                )}
                {isPDF && (
                    <div className="w-full rounded-lg border border-[#E9DFCE] dark:border-border-dark bg-[#F9F6F0] dark:bg-background-dark p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="text-[#A18249] dark:text-text-dark-muted" size={20} />
                            <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">{imageFile.name}</span>
                        </div>
                        <div className="flex justify-center items-center h-40">
                            <div className="text-center">
                                <FileText className="text-[#A18249] dark:text-text-dark-muted mx-auto mb-2" size={40} />
                                <p className="text-[#1C160C] dark:text-text-dark text-sm">PDF Document</p>
                                <p className="text-[#A18249] dark:text-text-dark-muted text-xs mt-1">
                                    {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <iframe
                                    src={imagePreview}
                                    className="w-full h-40 mt-2 rounded border border-[#E9DFCE] dark:border-border-dark"
                                    title="PDF Preview"
                                />
                            </div>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 text-[#A18249] p-1.5 hover:text-[#1C160C] transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 gap-3 @container">
            <label className="flex flex-col min-w-40 h-full flex-1">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div className="flex border border-[#E9DFCE] dark:border-border-dark bg-[#FFFFFF] dark:bg-card-dark justify-end pl-[15px] pr-[15px] pt-[15px] rounded-l-xl border-r-0">
                        <div 
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                            style={{ backgroundImage: `url(${user?.profilePicture || "/avatar.png"})` }}
                        />
                    </div>
                    <div className="flex flex-1 flex-col">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1C160C] dark:text-text-dark focus:outline-0 focus:ring-0 border border-[#E9DFCE] bg-[#FFFFFF] dark:bg-card-dark focus:border-[#E9DFCE] dark:focus:border-border-dark h-auto placeholder:text-[#D0BB95] dark:placeholder:text-text-dark-muted rounded-l-none border-l-0 rounded-b-none border-b-0 text-base font-normal leading-normal pt-[22px]"
                            rows="3"
                        />
                        {renderMediaPreview()}
                        <div className="flex border border-[#E9DFCE] dark:border-border-dark bg-[#FFFFFF] dark:bg-card-dark justify-end pr-[15px] rounded-br-xl border-l-0 border-t-0 px-[15px] pb-[15px]">
                            <div className="flex items-center gap-4 justify-end">
                                <div className="flex items-center gap-1">
                                    <label className="flex items-center justify-center p-1.5 cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*,video/*,.pdf"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="text-[#A18249] dark:text-text-dark-muted hover:text-[#1C160C] dark:hover:text-text-dark transition-colors">
                                            <Image size={20} />
                                        </div>
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isPending || isChecking || (!content.trim() && !imageFile)}
                                    className="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#019863] text-[#FFFFFF] text-sm font-medium leading-normal disabled:opacity-50 hover:bg-[#017a4f] transition-colors"
                                >
                                    {isPending || isChecking ? (
                                        <Loader className="animate-spin inline-block" />
                                    ) : (
                                        <span className="truncate">Post</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </label>
        </form>
    );
};

export default PostCreation;

