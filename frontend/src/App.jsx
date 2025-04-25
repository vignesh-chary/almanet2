import "lazysizes";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/layout/Layout";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import SettingsPage from "./pages/SettingsPage";
import { useAuth } from "./hooks/useAuth";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";

// Discussion Pages
import DiscussionsPage from "./pages/discussions/DiscussionsPage";
import DiscussionDetailPage from "./pages/discussions/DiscussionDetailPage";

// Events Pages
import EventPage from "./pages/events/EventPage";
import EventDetailsPage from "./pages/events/EventDetailsPage";
import EventList from "./components/admin/EventList";
import EventCreate from "./components/admin/EventCreate";
import EventDetails from "./components/admin/EventDetails";
import EventEdit from "./components/admin/EventEdit";

// Admin Pages
import AdminPage from "./pages/admin/AdminPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";

// Job Pages
import JobPage from "./components/jobs/JobPage";
import JobDetails from "./components/jobs/JobDetails";
import JobDetailsAlumni from "./components/jobs/JobDetailsAlumni";
import CreateJob from "./components/jobs/CreateJob";
import EditJob from "./components/jobs/EditJob";
import JobDashboard from "./components/jobs/JobDashboard";
import MyAppliedJobs from "./components/jobs/MyAppliedJobs";

// Mentorship Pages
import MentorshipRequestsPage from "./pages/mentorshippages/MentorshipRequestsPage";
import MentorRegister from "./components/mentorship/MentorRegister";
import AlumniMentorshipHome from "./pages/mentorshippages/AlumniMentorshipHome";
// import StudentMentorshipHome from "./pages/mentorshippages/StudentMentorshipHome";
import FindMentor from "./pages/mentorshippages/FindMentor";
import MyMentors from "./components/mentorship/MyMentors.jsx";
import GoalsPage from "./components/mentorship/Goals";
import ScheduleMeetingPage from "./components/mentorship/Schedule";
import MyMeetingsPage from "./components/mentorship/MyMeetings";
import MentorDashboard from "./pages/mentorshippages/MentorDashboard.jsx";

// Project Pages
import ProjectDashboard from "./components/Project/ProjectDashboard";
import ProjectDetails from "./components/Project/ProjectDetails";

// Search Page
import SearchResults from "./pages/SearchResults";
import ChatBox from "./components/ChatBox";
import MessagesPage from "./pages/MessagesPage";

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { data: authUser, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Layout>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/forgot-password"
          element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />}
        />
        <Route
          path="/reset-password"
          element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />}
        />

        {/* Discussion Routes */}
        <Route
          path="/discussions"
          element={authUser ? <DiscussionsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/discussions/:id"
          element={authUser ? <DiscussionDetailPage /> : <Navigate to="/login" />}
        />

        {/* User Routes */}
        <Route
          path="/notifications"
          element={authUser ? <NotificationsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/network"
          element={authUser ? <NetworkPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/post/:postId"
          element={authUser ? <PostPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />

        {/* Events Routes */}
        <Route
          path="/events"
          element={authUser ? <EventPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/events/create"
          element={authUser ? <EventCreate /> : <Navigate to="/login" />}
        />
        <Route
          path="/events/:eventId"
          element={authUser ? <EventDetailsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-events"
          element={authUser ? <EventList /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-events/:eventId"
          element={authUser ? <EventDetails /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-events/:eventId/edit"
          element={authUser ? <EventEdit /> : <Navigate to="/login" />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={authUser?.role === "admin" ? <AdminPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/dashboard"
          element={authUser?.role === "admin" ? <AdminPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/analytics"
          element={authUser?.role === "admin" ? <AnalyticsPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/event-posts"
          element={authUser?.role === "admin" ? <AdminPostsPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/users"
          element={authUser?.role === "admin" ? <AdminPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/events"
          element={authUser?.role === "admin" ? <EventList /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/events/create"
          element={authUser?.role === "admin" ? <EventCreate /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/events/:eventId"
          element={authUser?.role === "admin" ? <EventDetails /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/events/:eventId/edit"
          element={authUser?.role === "admin" ? <EventEdit /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/jobs"
          element={authUser?.role === "admin" ? <JobPage /> : <Navigate to="/" />}
        />

        {/* Job Routes */}
        <Route
          path="/jobs"
          element={authUser ? <JobPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/jobs/:id"
          element={authUser ? <JobDetails /> : <Navigate to="/login" />}
        />
        <Route
          path="/job-dashboard/alumni/jobs/:id"
          element={authUser?.role === "alumni" ? <JobDetailsAlumni /> : <Navigate to="/login" />}
        />
        <Route
          path="/create-job"
          element={authUser?.role === "alumni" ? <CreateJob /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-job/:jobId"
          element={authUser?.role === "alumni" ? <EditJob /> : <Navigate to="/login" />}
        />
        <Route
          path="/job-dashboard"
          element={authUser?.role === "alumni" ? <JobDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-applied-jobs"
          element={authUser ? <MyAppliedJobs /> : <Navigate to="/login" />}
        />

        {/* Mentorship Routes */}
        <Route
          path="/alumni-mentorship-home"
          element={authUser?.role === "alumni" ? <AlumniMentorshipHome /> : <Navigate to="/login" />}
        />
        {/* <Route
          path="/student-mentorship-home"
          element={authUser?.role === "student" ? <StudentMentorshipHome /> : <Navigate to="/login" />}
        /> */}
        <Route
          path="/mentorship-requests"
          element={authUser?.role === "alumni" ? <MentorshipRequestsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/mentor/register"
          element={authUser?.role === "alumni" ? <MentorRegister /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/find-mentor"
          element={authUser?.role === "student" ? <FindMentor /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-mentors"
          element={authUser?.role === "student" ? <MyMentors /> : <Navigate to="/login" />}
        />
        <Route
          path="/mentorships/:mentorshipId/goals"
          element={authUser ? <GoalsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={authUser ? <SearchResults /> : <Navigate to="/login" />}
        />
        <Route
          path="/messages"
          element={authUser ? <MessagesPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/mentorship-dashboard"
          element={authUser?.role === "alumni" ? <MentorDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/schedule/:mentorId"
          element={authUser ? <ScheduleMeetingPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/meetings"
          element={authUser ? <MyMeetingsPage /> : <Navigate to="/login" />}
        />

        {/* Project Routes */}
        <Route
          path="/projects"
          element={authUser ? <ProjectDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/:id"
          element={authUser ? <ProjectDetails /> : <Navigate to="/login" />}
        />
      </Routes>

      {/* ChatBox Component */}
      {/* {authUser && <ChatBox />} */}
      <Toaster />
    </Layout>
  );
}

export default App;