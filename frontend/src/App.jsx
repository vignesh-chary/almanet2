import "lazysizes";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";

// Events Pages
import EventPage from "./pages/events/EventPage";
import EventDetailsPage from "./pages/events/EventDetailsPage";
import EventList from "./components/admin/EventList";
import EventCreate from "./components/admin/EventCreate";
import EventDetails from "./components/admin/EventDetails";

// Admin Pages
import AdminPage from "./pages/admin/AdminPage";

// Job Pages
import JobPage from "./components/jobs/JobPage";
import JobDetails from "./components/jobs/JobDetails";
import JobDetailsAlumni from "./components/jobs/JobDetailsAlumni";
import CreateJob from "./components/jobs/CreateJob";
import EditJob from "./components/jobs/EditJob";  // Added EditJob Component
import JobDashboard from "./components/jobs/JobDashboard";
import MyAppliedJobs from "./components/jobs/MyAppliedJobs";
import MentorshipRequestsPage from "./pages/mentorshippages/MentorshipRequestsPage";
import MentorRegister from "./components/mentorship/MentorRegister";
import AlumniMentorshipHome from "./pages/mentorshippages/AlumniMentorshipHome";
import MentorshipDashboard from "./pages/mentorshippages/MentorshipDashboard";



import StudentMentorshipHome from "./pages/mentorshippages/StudentMentorshipHome";
import FindMentor from "./pages/mentorshippages/FindMentor";

import MyMentors from "./components/mentorship/MyMentors.jsx";

import GoalsPage from "./components/mentorship/Goals";
import Schedule from "./components/mentorship/Schedule";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (err) {
        if (err.response && err.response.status === 401) {
          return null;
        }
        toast.error(err.response.data.message || "Something went wrong");
      }
    },
  });

  if (isLoading) return null;

  return (
    <Layout>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />

        {/* User Routes */}
        <Route
          path="/notifications"
          element={authUser ? <NotificationsPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/network"
          element={authUser ? <NetworkPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/post/:postId"
          element={authUser ? <PostPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
        />

        {/* Events Routes */}
        <Route
          path="/events"
          element={authUser ? <EventPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/events/:eventId"
          element={authUser ? <EventDetailsPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/admin/events"
          element={authUser?.role === "admin" ? <EventList /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/events/create"
          element={authUser?.role === "admin" ? <EventCreate /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/events/:eventId"
          element={authUser?.role === "admin" ? <EventDetails /> : <Navigate to="/login" />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={authUser?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />}
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
        <Route path="/job-dashboard/alumni/jobs/:id" element={authUser?.role === "alumni" ? <JobDetailsAlumni /> : <Navigate to="/login" />} 
        />
        <Route
          path="/create-job"
          element={authUser?.role === "alumni" ? <CreateJob /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-job/:jobId"
          element={authUser?.role === "alumni" ? <EditJob /> : <Navigate to="/login" />}  // Fixed EditJob route condition
        />
		<Route path="/job-dashboard" element={authUser?.role === "alumni" ? <JobDashboard /> : <Navigate to="/login" />}  />
    <Route
          path="/my-applied-jobs"
          element={
            authUser ? <MyAppliedJobs /> : <Navigate to="/login" />
          } // My Applied Jobs Route
        />
      <Route path="alumni-mentorship-home" element={authUser?.role === "alumni" ? <AlumniMentorshipHome /> : <Navigate to="/login" />}  />
      <Route path="student-mentorship-home" element={authUser?.role === "student" ? <StudentMentorshipHome /> : <Navigate to="/login" />}  />
      <Route path="/mentorship-requests" element={authUser?.role === "alumni" ? <MentorshipRequestsPage /> : <Navigate to="/login" />}  />
      <Route path="/mentor/register" element={authUser?.role == "alumni" ? <MentorRegister /> : <Navigate to="/login"  />} />
      <Route path="/mentorship-dashboard" element={authUser ? <MentorshipDashboard /> : <Navigate to="/login"  />} />
      <Route path="/find-mentor"  element ={authUser?.role === "student" ? <FindMentor /> : <Navigate to="/login"/>} />
      <Route path="/my-mentors" element={authUser?.role === "student" ? <MyMentors /> : <Navigate to="/login"/>} />
      <Route path="/mentorships/:mentorshipId/goals" element={authUser ? <GoalsPage /> : <Navigate to="/login"/>} />  {/* Corrected Route */}
      <Route path="/schedule" element={authUser? <Schedule /> : <Navigate to="/login"/>} />
      </Routes>

      <Toaster />
    </Layout>
  );
}

export default App;
