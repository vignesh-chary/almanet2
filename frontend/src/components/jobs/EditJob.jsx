import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";

const EditJob = () => {
  const { jobId } = useParams(); // Job ID from the route
  const [jobData, setJobData] = useState({}); // State for job details
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const navigate = useNavigate(); // Hook for navigation

  // Fetch job details on component mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axiosInstance.get(`/jobs/${jobId}`); // Fetch job details
        setJobData(response.data); // Set the job data
      } catch (err) {
        setError("Failed to fetch job details.");
        console.error("Error fetching job:", err);
      } finally {
        setIsLoading(false); // Stop loading once the fetch is complete
      }
    };

    fetchJob();
  }, [jobId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/jobs/${jobId}`, jobData); // Update job
      navigate("/job-dashboard"); // Redirect to the dashboard
    } catch (err) {
      console.error("Error updating job:", err);
      setError("Failed to update the job. Please try again.");
    }
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading job details...</p>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // Render the form
  return (
    <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit Job</h1>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Job Title</label>
          <input
            type="text"
            placeholder="Enter Job Title"
            value={jobData.title || ""}
            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Job Description</label>
          <textarea
            placeholder="Enter Job Description"
            value={jobData.description || ""}
            onChange={(e) =>
              setJobData({ ...jobData, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Location</label>
          <input
            type="text"
            placeholder="Enter Location"
            value={jobData.location || ""}
            onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Job Type</label>
          <input
            type="text"
            placeholder="Enter Job Type"
            value={jobData.jobType || ""}
            onChange={(e) => setJobData({ ...jobData, jobType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Experience Level</label>
          <input
            type="text"
            placeholder="Enter Experience Level"
            value={jobData.experienceLevel || ""}
            onChange={(e) =>
              setJobData({ ...jobData, experienceLevel: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Position</label>
          <input
            type="text"
            placeholder="Enter Position"
            value={jobData.position || ""}
            onChange={(e) => setJobData({ ...jobData, position: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Requirements</label>
          <textarea
            placeholder="Enter Requirements"
            value={jobData.requirements || ""}
            onChange={(e) =>
              setJobData({ ...jobData, requirements: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Update Job
        </button>
      </form>
    </div>
  );
};

export default EditJob;
