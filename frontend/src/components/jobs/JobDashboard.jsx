import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { useTheme } from "../../context/ThemeContext";

const JobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

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
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await axiosInstance.delete(`/jobs/${jobId}`);
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const cardClassName = `p-6 rounded-xl ${
    isDarkMode ? 'bg-background-dark' : 'bg-background'
  }`;

  const textClassName = isDarkMode ? 'text-text-dark' : 'text-text';
  const mutedTextClassName = isDarkMode ? 'text-text-dark-muted' : 'text-text-muted';
  const primaryButtonClassName = `inline-flex items-center justify-center px-3 py-1.5 rounded text-sm font-medium ${
    isDarkMode ? 'bg-primary-dark text-white' : 'bg-primary text-white'
  }`;
  const secondaryButtonClassName = `inline-flex items-center justify-center px-3 py-1.5 rounded text-sm font-medium ${
    isDarkMode ? 'bg-secondary-dark text-white' : 'bg-primary text-white'
  }`;
  const deleteButtonClassName = `inline-flex items-center justify-center px-3 py-1.5 rounded text-sm font-medium ${
    isDarkMode ? 'bg-error-dark text-white' : 'bg-error text-white'
  }`;

  return (
    <div className={`min-h-screen p-6 ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${textClassName}`}>
              Job Dashboard
            </h1>
            <p className={mutedTextClassName}>
              Manage your job postings with ease
            </p>
          </div>
          <Link
            to="/create-job"
            className={primaryButtonClassName}
          >
            Create New Job
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className={`w-10 h-10 border-4 ${
              isDarkMode ? 'border-primary-dark' : 'border-primary'
            } border-dashed rounded-full animate-spin`}></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className={`text-center py-12 ${mutedTextClassName}`}>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.5V21m-6-6h6m4-4H5m-4 9v-5.5l12-3m0 0l6 2.5V13.5m0 0L12 11l-6 2.5m-6-.5v5.5L6 9m0 0l6-2.5V13.5m0 0L18 11l6-2.5m-6-2.5v-5.5L6 15.5m0 0l6 2.5V7.5m0 0L18 15.5l6-2.5v-5.5L12 19.5" />
            </svg>
            <p className="text-lg mt-4 mb-4">No job postings yet</p>
            <Link
              to="/create-job"
              className={primaryButtonClassName}
            >
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <div key={job._id} className={cardClassName}>
                <h3 className={`text-xl font-semibold mb-3 ${textClassName}`}>
                  {job.title}
                </h3>
                <div className={`space-y-2 text-sm ${mutedTextClassName}`}>
                  <p>
                    <span className="font-medium">Company:</span> {job.company}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {job.location}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span> {job.jobType}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/job-dashboard/alumni/jobs/${job._id}`}
                    className={secondaryButtonClassName}
                  >
                    View
                  </Link>
                  <Link
                    to={`/edit-job/${job._id}`}
                    className={secondaryButtonClassName}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className={deleteButtonClassName}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDashboard;