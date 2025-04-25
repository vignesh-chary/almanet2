import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { useTheme } from "../../context/ThemeContext";

const EditJob = () => {
  const { jobId } = useParams();
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "Full-Time",
    experienceLevel: "Entry",
    position: "",
    salary: 0,
    requirements: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const jobTypes = ["Full-Time", "Part-Time", "Contract", "Internship"];
  const experienceLevels = ["Entry", "Mid", "Senior"];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axiosInstance.get(`/jobs/${jobId}`);
        const data = response.data;
        
        // Ensure all required fields have values
        setJobData({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          jobType: data.jobType || "Full-Time",
          experienceLevel: data.experienceLevel || "Entry",
          position: data.position || "",
          salary: data.salary || 0,
          requirements: Array.isArray(data.requirements) ? data.requirements : []
        });
      } catch (err) {
        setError("Failed to fetch job details.");
        console.error("Error fetching job:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure all required fields are present and properly formatted
      const dataToSend = {
        ...jobData,
        salary: Number(jobData.salary) || 0,
        jobType: jobData.jobType || "Full-Time",
        experienceLevel: jobData.experienceLevel || "Entry",
        requirements: Array.isArray(jobData.requirements) ? jobData.requirements : []
      };

      console.log("Sending data:", dataToSend); // Debug log

      await axiosInstance.put(`/jobs/${jobId}`, dataToSend);
      navigate("/job-dashboard");
    } catch (err) {
      console.error("Error updating job:", err);
      setError("Failed to update the job. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDarkMode ? 'bg-background-dark' : 'bg-background'
      }`}>
        <div className={`w-8 h-8 border-4 ${
          isDarkMode ? 'border-primary-dark' : 'border-primary'
        } border-dotted rounded-full animate-spin`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${
        isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'
      }`}>
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-text-dark' : 'text-text'
        }`}>
          Edit Job
        </h1>

        <form
          onSubmit={handleSubmit}
          className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-background-dark' : 'bg-background'
          }`}
        >
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 ${
                isDarkMode ? 'text-text-dark' : 'text-text'
              }`}>
                Job Title
              </label>
              <input
                type="text"
                value={jobData.title}
                onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                    : 'bg-white border-border text-text placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${
                isDarkMode ? 'text-text-dark' : 'text-text'
              }`}>
                Description
              </label>
              <textarea
                value={jobData.description}
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                    : 'bg-white border-border text-text placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                rows="4"
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${
                isDarkMode ? 'text-text-dark' : 'text-text'
              }`}>
                Location
              </label>
              <input
                type="text"
                value={jobData.location}
                onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                    : 'bg-white border-border text-text placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 ${
                  isDarkMode ? 'text-text-dark' : 'text-text'
                }`}>
                  Job Type
                </label>
                <select
                  value={jobData.jobType}
                  onChange={(e) => setJobData({ ...jobData, jobType: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                      : 'bg-white border-border text-text placeholder-text-muted'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  required
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block mb-2 ${
                  isDarkMode ? 'text-text-dark' : 'text-text'
                }`}>
                  Experience Level
                </label>
                <select
                  value={jobData.experienceLevel}
                  onChange={(e) => setJobData({ ...jobData, experienceLevel: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                      : 'bg-white border-border text-text placeholder-text-muted'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  required
                >
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block mb-2 ${
                isDarkMode ? 'text-text-dark' : 'text-text'
              }`}>
                Position
              </label>
              <input
                type="text"
                value={jobData.position}
                onChange={(e) => setJobData({ ...jobData, position: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                    : 'bg-white border-border text-text placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                required
              />
            </div>

            <div>
              <label className={`block mb-2 ${
                isDarkMode ? 'text-text-dark' : 'text-text'
              }`}>
                Salary
              </label>
              <input
                type="number"
                value={jobData.salary}
                onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                    : 'bg-white border-border text-text placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                required
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className={`block mb-2 ${
                isDarkMode ? 'text-text-dark' : 'text-text'
              }`}>
                Requirements
              </label>
              <textarea
                value={jobData.requirements.join('\n')}
                onChange={(e) => setJobData({ 
                  ...jobData, 
                  requirements: e.target.value.split('\n').filter(req => req.trim())
                })}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                    : 'bg-white border-border text-text placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                rows="4"
                placeholder="Enter each requirement on a new line"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-6 rounded-lg font-medium ${
                isDarkMode
                  ? 'bg-primary-dark text-white'
                  : 'bg-primary text-white'
              }`}
            >
              Update Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
