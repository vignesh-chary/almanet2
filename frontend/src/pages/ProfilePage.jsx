import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useTheme } from "../context/ThemeContext";
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-hot-toast";

import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import ImageCropper from "../components/ImageCropper";

const ProfilePage = () => {
	const { username } = useParams();
	const queryClient = useQueryClient();
	const { isDarkMode } = useTheme();
	const fileInputRef = useRef(null);
	const [showCropper, setShowCropper] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [isEditing, setIsEditing] = useState(false);

	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
	});

	const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
		queryKey: ["userProfile", username],
		queryFn: () => axiosInstance.get(`/users/${username}`),
	});

	const { mutate: updateProfile } = useMutation({
		mutationFn: async (updatedData) => {
			await axiosInstance.put("/users/profile", updatedData);
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			queryClient.invalidateQueries(["userProfile", username]);
		},
	});

	const updateProfilePictureMutation = useMutation({
		mutationFn: async (formData) => {
			const response = await axiosInstance.patch("/users/profile-picture", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["userProfile", username]);
			queryClient.invalidateQueries(["authUser"]);
			toast.success("Profile picture updated successfully!");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to update profile picture");
		},
	});

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) { // 5MB limit
				toast.error("File size should be less than 5MB");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				setSelectedImage(reader.result);
				setShowCropper(true);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleCropComplete = async (croppedImageBlob) => {
		const formData = new FormData();
		formData.append("file", croppedImageBlob, "profile-picture.jpg");
		updateProfilePictureMutation.mutate(formData);
		setShowCropper(false);
		setSelectedImage(null);
	};

	if (isLoading || isUserProfileLoading) return null;

	const isOwnProfile = authUser.username === userProfile.data.username;
	const userData = isOwnProfile ? authUser : userProfile.data;

	const handleSave = (updatedData) => {
		updateProfile(updatedData);
	};

	return (
		<div className={`min-h-screen ${isDarkMode ? 'bg-background-dark' : 'bg-background'}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<ProfileHeader 
					userData={userData} 
					isOwnProfile={isOwnProfile} 
					onSave={handleSave} 
					isDarkMode={isDarkMode}
					onProfilePictureClick={() => fileInputRef.current?.click()}
				/>
			</div>

			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept="image/*"
				className="hidden"
			/>

			{showCropper && (
				<ImageCropper
					image={selectedImage}
					onCropComplete={handleCropComplete}
					onClose={() => {
						setShowCropper(false);
						setSelectedImage(null);
					}}
				/>
			)}
		</div>
	);
};

export default ProfilePage;

