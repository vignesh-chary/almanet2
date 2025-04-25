import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SearchBar from "../SearchBar";
import { 
    Settings, Bell, Home, Users, LogOut, 
    User, BookOpen, Lock, Search, MoreHorizontal,
    Sun, Moon
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
    const queryClient = useQueryClient();
    const { isDarkMode, toggleTheme } = useTheme();
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { data: notifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => axiosInstance.get("/notifications"),
        enabled: !!authUser,
        initialData: { data: [] }
    });

    const { data: connectionRequests } = useQuery({
        queryKey: ["connectionRequests"],
        queryFn: async () => axiosInstance.get("/connections/requests"),
        enabled: !!authUser,
        initialData: { data: [] }
    });

    const unreadNotificationCount = notifications?.data?.filter((notif) => !notif.read)?.length || 0;
    const unreadConnectionRequestsCount = connectionRequests?.data?.length || 0;

    const { mutate: logout } = useMutation({
        mutationFn: () => axiosInstance.post("/auth/logout"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
    });

    // Close search bar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSearchOpen]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutsideMenu = (event) => {
            if (isMenuOpen && !event.target.closest(".menu-container")) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutsideMenu);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideMenu);
        };
    }, [isMenuOpen]);

    return (
        <nav className="bg-white dark:bg-background-dark border-b border-muted dark:border-border-dark sticky top-0 z-50 font-sans transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 relative">

                    {/* Logo & Search */}
                    <div className="flex items-center gap-3 flex-1">
                        <Link to="/" className="text-text dark:text-text-dark font-bold text-xl tracking-tight">
                            Almanet
                        </Link>

                        {/* Mobile Search (Full Width) */}
                        {authUser && (
                            <div className="relative lg:hidden flex-1" ref={searchRef}>
                                {isSearchOpen ? (
                                    <div className="absolute left-2 right-2 top-0 h-full flex items-center">
                                        <SearchBar fullWidth={true} />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsSearchOpen(true)}
                                        className="p-2 rounded-full bg-secondary text-dark"
                                    >
                                        <Search size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Desktop Search Bar */}
                        {authUser && (
                            <div className="hidden lg:flex items-center h-10 pl-3 w-64">
                                <SearchBar fullWidth={false} />
                            </div>
                        )}
                    </div>

                    {/* Right Side Icons (Hide when Search is Active) */}
                    {!isSearchOpen && (
                        <div className="flex items-center gap-4 md:gap-6 menu-container">
                            {authUser ? (
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="lg:flex items-center hidden justify-end space-x-6">
                                        <Link to="/" className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5">
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <Home className="text-text dark:text-text-dark" size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer">Home</span>
                                        </Link>

                                        <Link to="/network" className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5 relative">
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <Users className="text-text dark:text-text-dark" size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer">Network</span>
                                            {unreadConnectionRequestsCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full size-4 flex items-center justify-center">
                                                    {unreadConnectionRequestsCount}
                                                </span>
                                            )}
                                        </Link>

                                        {authUser.role === "admin" && (
                                            <Link
                                                to="/admin"
                                                className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5"
                                            >
                                                <div className="flex items-center justify-center h-10 w-10">
                                                    <Lock className="text-text dark:text-text-dark" size={20} />
                                                </div>
                                                <span className="text-xs cursor-pointer">Admin</span>
                                            </Link>
                                        )}

                                        {authUser.role !== "admin" && (
                                            <Link 
                                                to={authUser.role === "alumni" ? "/alumni-mentorship-home" : "/my-mentors"}
                                                className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5">
                                                <div className="flex items-center justify-center h-10 w-10">
                                                    <BookOpen className="text-text dark:text-text-dark" size={20} />
                                                </div>
                                                <span className="text-xs cursor-pointer">Mentorship</span>
                                            </Link>
                                        )}

                                        <Link to="/notifications" className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5 relative">
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <Bell className="text-text dark:text-text-dark" size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer text-text dark:text-text-dark">Notifications</span>
                                            {unreadNotificationCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full size-4 flex items-center justify-center">
                                                    {unreadNotificationCount}
                                                </span>
                                            )}
                                        </Link>

                                        <Link
                                            to={`/profile/${authUser.username}`}
                                            className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5"
                                        >
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-cover bg-center"
                                                style={{ backgroundImage: `url(${authUser.profilePicture || '/avatar.png'})` }}
                                            >
                                            </div>
                                            <span className="text-xs cursor-pointer">Profile</span>
                                        </Link>
                                        <button
                                            onClick={toggleTheme}
                                            className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5"
                                        >
                                            <div className="flex items-center justify-center h-10 w-10">
                                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                            </div>
                                            <span className="text-xs cursor-pointer">Theme</span>
                                        </button>
                                        <button 
                                            onClick={() => logout()} 
                                            className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5"
                                        >
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <LogOut size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer">Logout</span>
                                        </button>
                                        <Link to="/settings" className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5">
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <Settings size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer">Settings</span>
                                        </Link>
                                    </div>
                                    <div className="lg:hidden flex gap-3 items-center">
                                         <Link to="/" className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5">
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <Home className="text-text dark:text-text-dark" size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer">Home</span>
                                        </Link>

                                        <Link to="/network" className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5 relative">
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <Users className="text-text dark:text-text-dark" size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer">Network</span>
                                            {unreadConnectionRequestsCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full size-4 flex items-center justify-center">
                                                    {unreadConnectionRequestsCount}
                                                </span>
                                            )}
                                        </Link>

                                        {authUser.role === "admin" && (
                                            <Link
                                                to="/admin"
                                                className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5"
                                            >
                                                <div className="flex items-center justify-center h-10 w-10">
                                                    <Lock className="text-text dark:text-text-dark" size={20} />
                                                </div>
                                                <span className="text-xs cursor-pointer">Admin</span>
                                            </Link>
                                        )}

                                        {authUser.role !== "admin" && (
                                            <Link 
                                                to={authUser.role === "alumni" ? "/alumni-mentorship-home" : "/my-mentors"}
                                                className="text-text dark:text-text-dark hover:text-accent dark:hover:text-accent-dark transition-colors flex flex-col items-center gap-0.5">
                                                <div className="flex items-center justify-center h-10 w-10">
                                                    <BookOpen className="text-text dark:text-text-dark" size={20} />
                                                </div>
                                                <span className="text-xs cursor-pointer">Mentorship</span>
                                            </Link>
                                        )}

                                        <Link to="/notifications" className="text-dark hover:text-accent transition-colors flex flex-col items-center gap-0.5 relative">
                                            <div className="flex items-center justify-center h-10 w-10">
                                                <Bell className="text-text dark:text-text-dark" size={20} />
                                            </div>
                                            <span className="text-xs cursor-pointer">Notifications</span>
                                            {unreadNotificationCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full size-4 flex items-center justify-center">
                                                    {unreadNotificationCount}
                                                </span>
                                            )}
                                        </Link>

                                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-dark hover:text-accent transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                    {isMenuOpen && (
                                        <div className="absolute top-16 right-0 bg-white rounded-md shadow-md p-2 z-50 flex gap-3">
                                            <Link
                                                to={`/profile/${authUser.username}`}
                                                className="flex flex-col items-center gap-0.5"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${authUser.profilePicture || '/avatar.png'})` }}
                                                >
                                                </div>
                                                <span className="text-xs cursor-pointer">Profile</span>
                                            </Link>
                                            <button 
                                                onClick={() => logout()} 
                                                className="flex flex-col items-center gap-0.5"
                                            >
                                                <div className="p-2 rounded-full hover:bg-gray-100">
                                                    <LogOut size={20} />
                                                </div>
                                                <span className="text-xs cursor-pointer">Logout</span>
                                            </button>
                                            <Link to="/settings" className="flex flex-col items-center gap-0.5">
                                                <div className="p-2 rounded-full hover:bg-gray-100">
                                                    <Settings size={20} />
                                                </div>
                                                <span className="text-xs cursor-pointer">Settings</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-dark hover:text-accent transition-colors px-4 py-2">
                                        Sign In
                                    </Link>
                                    <Link to="/signup" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-[#01794d] transition-colors">
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;