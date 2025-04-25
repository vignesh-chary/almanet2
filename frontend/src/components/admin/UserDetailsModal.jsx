import React, { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const UserDetailsModal = ({ user, onClose, onSave }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        location: user.location || "",
        about: user.about || "",
        headline: user.headline || "",
        role: user.role || "student",
        skills: user.skills || [],
        designation: user.designation || "",
        company: user.company || "",
        industry: user.industry || "",
        degree: user.degree || "",
        yearOfStudy: user.yearOfStudy || "",
        interests: user.interests || []
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [bannerImg, setBannerImg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
                formDataToSend.append(key, JSON.stringify(value));
            } else {
                formDataToSend.append(key, value);
                    }
            }
        });

        // Append files if they exist
        if (profilePicture) {
            formDataToSend.append("profilePicture", profilePicture);
        }
        if (bannerImg) {
            formDataToSend.append("bannerImg", bannerImg);
        }

            await onSave({ userId: user._id, data: formDataToSend });
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e, setFile) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-2xl rounded-lg ${isDarkMode ? 'bg-card-dark' : 'bg-card'} p-6`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                        Edit User Details
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}
                            >
                                <option value="student">Student</option>
                                <option value="alumni">Alumni</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                            About
                        </label>
                        <textarea
                            value={formData.about}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            rows={3}
                            className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                Profile Picture
                            </label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={profilePicture ? URL.createObjectURL(profilePicture) : user.profilePicture || "/avatar.png"}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                                    <ImageIcon size={16} />
                                    <span>Change</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, setProfilePicture)}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>
                                Banner Image
                            </label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={bannerImg ? URL.createObjectURL(bannerImg) : user.bannerImg || "/banner-placeholder.png"}
                                    alt="Banner"
                                    className="w-32 h-16 rounded object-cover"
                                />
                                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'}`}>
                                    <ImageIcon size={16} />
                                    <span>Change</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, setBannerImg)}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'} border ${isDarkMode ? 'border-border-dark' : 'border-border'} disabled:opacity-50`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-primary-dark text-white' : 'bg-primary text-white'} disabled:opacity-50`}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetailsModal; 