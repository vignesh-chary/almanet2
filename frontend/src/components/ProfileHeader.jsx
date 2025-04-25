import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Camera, Clock, MapPin, UserCheck, UserPlus, X } from "lucide-react";
import ImageCropper from "./ImageCropper";
import AboutSection from "./AboutSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";

const ProfileHeader = ({ userData, onSave, isOwnProfile, isDarkMode, onProfilePictureClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [cropperOpen, setCropperOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
        queryKey: ["connectionStatus", userData._id],
        queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
        enabled: !isOwnProfile,
    });

    const isConnected = userData.connections?.some((connection) => connection === authUser?._id);

    const { mutate: sendConnectionRequest } = useMutation({
        mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
        onSuccess: () => {
            toast.success("Connection request sent");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: acceptRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request accepted");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: rejectRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request rejected");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: removeConnection } = useMutation({
        mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
        onSuccess: () => {
            toast.success("Connection removed");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const getConnectionStatus = useMemo(() => {
        if (isConnected) return "connected";
        if (!isOwnProfile && connectionStatus?.data?.status) return connectionStatus.data.status;
        return "not_connected";
    }, [isConnected, connectionStatus, isOwnProfile]);

    const renderConnectionButton = () => {
        const baseClass = "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
        switch (getConnectionStatus) {
            case "connected":
                return (
                    <div className='flex gap-2 justify-center'>
                        <div className={`${baseClass} bg-green-500 hover:bg-green-600`}>
                            <UserCheck size={20} className='mr-2' />
                            Connected
                        </div>
                        <button
                            className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
                            onClick={() => removeConnection(userData._id)}
                        >
                            <X size={20} className='mr-2' />
                            Remove Connection
                        </button>
                    </div>
                );

            case "pending":
                return (
                    <button className={`${baseClass} bg-yellow-500 hover:bg-yellow-600`}>
                        <Clock size={20} className='mr-2' />
                        Pending
                    </button>
                );

            case "received":
                return (
                    <div className='flex gap-2 justify-center'>
                        <button
                            onClick={() => acceptRequest(connectionStatus.data.requestId)}
                            className={`${baseClass} bg-green-500 hover:bg-green-600`}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => rejectRequest(connectionStatus.data.requestId)}
                            className={`${baseClass} bg-red-500 hover:bg-red-600`}
                        >
                            Reject
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        onClick={() => sendConnectionRequest(userData._id)}
                        className='bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center'
                    >
                        <UserPlus size={20} className='mr-2' />
                        Connect
                    </button>
                );
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedData((prev) => ({ ...prev, [event.target.name]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                setCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
            setEditedData(prev => ({ ...prev, profilePicture: reader.result }));
        };
        reader.readAsDataURL(blob);
    };

    const handleSave = () => {
        onSave(editedData);
        setIsEditing(false);
    };

    return (
        <>
            <div className={`${isDarkMode ? 'bg-background-dark' : 'bg-white'} shadow rounded-lg mb-6`}>
                <div
                    className='relative h-48 rounded-t-lg bg-cover bg-center'
                    style={{
                        backgroundImage: `url('${editedData.bannerImg || userData.bannerImg || "/banner.png"}')`,
                    }}
                >
                    {isEditing && (
                        <label className={`absolute top-2 right-2 ${isDarkMode ? 'bg-background-dark' : 'bg-white'} p-2 rounded-full shadow cursor-pointer`}>
                            <Camera size={20} className={isDarkMode ? 'text-text-dark' : 'text-text'} />
                            <input
                                type='file'
                                className='hidden'
                                name='bannerImg'
                                onChange={handleImageChange}
                                accept='image/*'
                            />
                        </label>
                    )}
                </div>

                <div className='p-4'>
                    <div className='relative -mt-20 mb-4'>
                        <div className="relative group w-32 h-32 mx-auto">
                            <img
                                src={editedData.profilePicture || userData.profilePicture || `https://ui-avatars.com/api/?name=${userData.name || 'Anonymous'}&background=random`}
                                alt={userData.name || "User"}
                                className="w-full h-full rounded-full object-cover ring-4 ring-primary"
                            />
                            {isOwnProfile && (
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={handleProfilePictureClick}
                                        className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <Camera size={24} className="text-white" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className='text-center mb-4'>
                        {isEditing ? (
                            <input
                                type='text'
                                defaultValue={userData.name}
                                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                className={`text-2xl font-bold mb-2 text-center w-full ${isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-white text-text'}`}
                            />
                        ) : (
                            <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>{userData.name || "Anonymous"}</h1>
                        )}

                        {isEditing ? (
                            <input
                                type='text'
                                defaultValue={userData.headline}
                                onChange={(e) => setEditedData({ ...editedData, headline: e.target.value })}
                                className={`text-center w-full ${isDarkMode ? 'bg-background-dark text-text-dark-muted' : 'bg-white text-text-muted'}`}
                            />
                        ) : (
                            <p className={isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}>{userData.headline || "No headline"}</p>
                        )}

                        <div className='flex justify-center items-center mt-2'>
                            <MapPin size={16} className={isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'} />
                            {isEditing ? (
                                <input
                                    type='text'
                                    defaultValue={userData.location}
                                    onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                                    className={`text-center ${isDarkMode ? 'bg-background-dark text-text-dark-muted' : 'bg-white text-text-muted'}`}
                                />
                            ) : (
                                <span className={isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}>{userData.location || "No location"}</span>
                            )}
                        </div>
                    </div>

                    {isOwnProfile ? (
                        isEditing ? (
                            <button
                                className='w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark transition duration-300'
                                onClick={handleSave}
                            >
                                Save Profile
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className='w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark transition duration-300'
                            >
                                Edit Profile
                            </button>
                        )
                    ) : (
                        <div className='flex justify-center'>{renderConnectionButton()}</div>
                    )}
                </div>
            </div>

            {cropperOpen && (
                <ImageCropper
                    image={selectedImage}
                    onCropComplete={handleCropComplete}
                    onClose={() => setCropperOpen(false)}
                />
            )}

            <div className="mt-8 space-y-8">
                <AboutSection 
                    userData={userData} 
                    isOwnProfile={isOwnProfile} 
                    onSave={onSave} 
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                />
                <ExperienceSection 
                    userData={userData} 
                    isOwnProfile={isOwnProfile} 
                    onSave={onSave} 
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                />
                <EducationSection 
                    userData={userData} 
                    isOwnProfile={isOwnProfile} 
                    onSave={onSave} 
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                />
                <SkillsSection 
                    userData={userData} 
                    isOwnProfile={isOwnProfile} 
                    onSave={onSave} 
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                />
            </div>
        </>
    );
};

export default ProfileHeader;