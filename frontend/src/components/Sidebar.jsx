import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  Briefcase, 
  FolderGit2,
  ChevronRight,
  Users,
  Settings,
  MessageSquare,
  Video,
  Menu,
  Cog,
  MessageCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const { data: user } = useQuery({ queryKey: ["authUser"] });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-card-dark shadow-md"
      >
        <Menu size={24} className="text-[#1C160C] dark:text-text-dark" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-[60px] h-[calc(100vh-60px)] bg-white dark:bg-card-dark overflow-y-auto z-30
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:w-80
        ${isMobileMenuOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80'}
        border-r border-border dark:border-border-dark
      `}>
        <div className="p-4 pt-16 lg:pt-4">
          <Link 
            to={`/profile/${user.username}`}
            className="group flex flex-col items-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              src={user.profilePicture || "/avatar.png"}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-[#F4EFE6] dark:border-border-dark transition-transform duration-300 group-hover:scale-105"
            />
            <h2 className="text-xl font-bold mt-4 text-[#1C160C] dark:text-text-dark group-hover:text-[#019863] dark:group-hover:text-primary-dark transition-colors">
              {user.name}
            </h2>
            <p className="text-[#A18249] dark:text-text-dark-muted text-sm mt-1">{user.headline}</p>
            <div className="flex items-center mt-2 text-[#1C160C] dark:text-text-dark">
              <Users size={16} className="mr-1" />
              <span className="text-sm font-medium">
                {user.connections?.length || 0} connections
              </span>
            </div>
          </Link>
        </div>

        <nav className="py-4">
          <ul className="space-y-2 px-4">
            <li>
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                  isActive("/") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Home</span>
                <ChevronRight 
                  className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16} 
                />
              </Link>
            </li>
            <li>
              <Link
                to="/meetings"
                className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                  isActive("/meetings") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Video className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">My Meetings</span>
                <ChevronRight 
                  className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16} 
                />
              </Link>
            </li>
            <li>
              <Link
                to="/messages"
                className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                  isActive("/messages") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Messages</span>
                <ChevronRight 
                  className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16} 
                />
              </Link>
            </li>
            <li>
              <Link
                to="/discussions"
                className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                  isActive("/discussions") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Discussions</span>
                <ChevronRight 
                  className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16} 
                />
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                  isActive("/events") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Events</span>
                <ChevronRight 
                  className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16} 
                />
              </Link>
            </li>
            {user.role === "student" && (
              <li>
                <Link
                  to="/jobs"
                  className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                    isActive("/jobs") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Briefcase className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                  <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Jobs</span>
                  <ChevronRight 
                    className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                    size={16} 
                  />
                </Link>
              </li>
            )}
            {/* <li>
              <Link
                to="/projects"
                className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                  isActive("/projects") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FolderGit2 className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Projects</span>
                <ChevronRight 
                  className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16} 
                />
              </Link>
            </li> */}

            {user.role === "alumni" && (
              <li>
                <Link
                  to="/job-dashboard"
                  className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                    isActive("/job-dashboard") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                  <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Manage Jobs</span>
                  <ChevronRight 
                    className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                    size={16} 
                  />
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/settings"
                className={`flex items-center px-3 py-2 rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-secondary-dark transition-colors group ${
                  isActive("/settings") ? "bg-[#F4EFE6] dark:bg-secondary-dark" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Cog className="text-[#1C160C] dark:text-text-dark mr-3" size={20} />
                <span className="text-[#1C160C] dark:text-text-dark text-sm font-medium">Settings</span>
                <ChevronRight 
                  className="ml-auto text-[#A18249] dark:text-text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16} 
                />
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4">
          <Link
            to={`/profile/${user.username}`}
            className="w-full flex items-center justify-center bg-[#019863] text-white py-2 px-4 rounded-full 
                   hover:bg-[#01794d] transition-colors text-sm font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Edit Profile
            <ChevronRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </>
  );
}