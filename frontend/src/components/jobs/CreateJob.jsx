import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { useTheme } from "../../context/ThemeContext";

const jobTypes = ["Full-Time", "Part-Time", "Internship", "Contract"];
const experienceLevels = ["Entry", "Mid", "Senior"];

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: jobTypes[0],
    experienceLevel: experienceLevels[0],
    position: "",
    salary: 0,
    requirements: "",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();

  const { mutate: createJob, isLoading } = useMutation({
    mutationFn: (newJob) =>
      axiosInstance.post("/jobs", newJob).then((res) => res.data),
    onSuccess: () => {
      alert("Job posted successfully!");
      queryClient.invalidateQueries(["jobs"]);
      navigate("/job-dashboard");
    },
    onError: (error) => {
      console.error("Error creating job:", error.message);
      alert("Failed to create job.");
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert requirements string to array
    const jobData = {
      ...formData,
      requirements: formData.requirements.split('\n').filter(req => req.trim()),
      salary: Number(formData.salary)
    };
    createJob(jobData);
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-text-dark' : 'text-text'
        }`}>
          Create Job Post
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
                name="title"
                value={formData.title}
                onChange={handleChange}
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
                name="description"
                value={formData.description}
                onChange={handleChange}
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
                name="location"
                value={formData.location}
                onChange={handleChange}
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
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-background-dark border-border-dark text-text-dark'
                      : 'bg-white border-border text-text'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
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
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-background-dark border-border-dark text-text-dark'
                      : 'bg-white border-border text-text'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
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
                name="position"
                value={formData.position}
                onChange={handleChange}
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
                name="salary"
                value={formData.salary}
                onChange={handleChange}
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
                Requirements (one per line)
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted'
                    : 'bg-white border-border text-text placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                rows="4"
                required
                placeholder="Enter requirements, one per line"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium ${
                isDarkMode
                  ? 'bg-primary-dark text-white'
                  : 'bg-primary text-white'
              }`}
            >
              {isLoading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
