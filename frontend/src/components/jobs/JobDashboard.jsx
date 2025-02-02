import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios"; // Ensure this is the correct path for axiosInstance

const JobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get("/jobs/my-jobs");
        setJobs(response.data.jobs || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    try {
      await axiosInstance.delete(`/jobs/${jobId}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Job Dashboard</h1>
      <Link
        to="/create-job"
        className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
      >
        Create Job Post
      </Link>

      {loading ? (
        <div className="mt-6 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
        </div>
      ) : jobs.length === 0 ? (
        <p className="mt-6 text-gray-600">No jobs available.</p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {jobs.map((job) => (
            <li
              key={job._id}
              className="bg-white p-4 rounded-lg shadow flex flex-col"
            >
              <h3 className="text-lg font-semibold text-gray-700">
                {job.title}
              </h3>
              <p className="text-gray-600">{job.description}</p>
              <div className="mt-4 flex justify-between">
                <Link
                  to={`alumni/jobs/${job._id}`}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  View Details
                </Link>
                <Link
                  to={`/edit-job/${job._id}`}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobDashboard;
