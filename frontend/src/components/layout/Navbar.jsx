import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";
import { Bell, Home, LogOut, User, Users, Lock, BookOpen } from "lucide-react";
import SearchBar from '../SearchBar';

const Navbar = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => axiosInstance.get("/notifications"),
    enabled: !!authUser,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => axiosInstance.get("/connections/requests"),
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const unreadNotificationCount = notifications?.data.filter((notif) => !notif.read).length;
  const unreadConnectionRequestsCount = connectionRequests?.data?.length;

  return (
    <nav className="bg-secondary shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          
          {/* Left Side - Logo and Search */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-primary">
              Almanet
            </Link>
            {authUser && <SearchBar />} {/* Integrated Search Bar */}
          </div>

          {/* Right Side - Navigation Links */}
          <div className="flex items-center gap-2 md:gap-6">
            {authUser ? (
              <>
                <Link to="/" className="text-neutral flex flex-col items-center hover:text-primary transition-colors">
                  <Home size={20} />
                  <span className="text-xs hidden md:block">Home</span>
                </Link>

                <Link to="/network" className="text-neutral flex flex-col items-center hover:text-primary transition-colors relative">
                  <Users size={20} />
                  <span className="text-xs hidden md:block">My Network</span>
                  {unreadConnectionRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs rounded-full size-3 md:size-4 flex items-center justify-center">
                      {unreadConnectionRequestsCount}
                    </span>
                  )}
                </Link>

                {/* Mentorship Button - Hidden for Admin Users */}
                {authUser.role !== 'admin' && (
                  <Link
                    to={authUser.role === "alumni" ? "/alumni-mentorship-home" : "/student-mentorship-home"}
                    className="text-neutral flex flex-col items-center hover:text-primary transition-colors"
                  >
                    <BookOpen size={20} />
                    <span className="text-xs hidden md:block">Mentorship</span>
                  </Link>
                )}

                <Link to="/notifications" className="text-neutral flex flex-col items-center hover:text-primary transition-colors relative">
                  <Bell size={20} />
                  <span className="text-xs hidden md:block">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs rounded-full size-3 md:size-4 flex items-center justify-center">
                      {unreadNotificationCount}
                    </span>
                  )}
                </Link>

                <Link to={`/profile/${authUser.username}`} className="text-neutral flex flex-col items-center hover:text-primary transition-colors">
                  <User size={20} />
                  <span className="text-xs hidden md:block">Me</span>
                </Link>

                {/* Admin Dashboard Link */}
                {authUser.role === "admin" && (
                  <Link
                    to="/admin"
                    className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
                  >
                    <Lock className="inline-block mr-1" size={18} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => logout()}
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
