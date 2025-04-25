import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const JobDetails = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ resume: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/jobs/${id}`);
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post(`/jobs/${id}/apply`, formData);
      return response.data;
    },
    onSuccess: () => {
      alert("You have successfully applied for the job!");
      queryClient.invalidateQueries(["job", id]);
    },
    onError: (error) => {
      alert(
        error.response?.data?.message || "Error applying for the job. Please try again."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      resume: formData.resume,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return (
    <div className={`flex justify-center items-center min-h-screen ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className={`w-8 h-8 border-4 ${
        isDarkMode ? 'border-primary-dark' : 'border-primary'
      } border-dotted rounded-full animate-spin`}></div>
    </div>
  );

  if (error) return (
    <div className={`p-6 ${
      isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'
    }`}>
      <p className="text-error">Error loading job details</p>
    </div>
  );

  return (
    <div className={`min-h-screen p-6 ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 rounded-xl shadow-card ${
          isDarkMode ? 'bg-background-dark' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-text-dark' : 'text-text'
          }`}>
            {job.title}
          </h2>
          
          <div className={`space-y-4 mb-6 ${
            isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
          }`}>
            <p>{job.description}</p>
            <p>Location: {job.location}</p>
            <p>Job Type: {job.jobType}</p>
          </div>

          <div className="border-t pt-6">
            <h3 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              Apply for this job
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block mb-2 ${
                  isDarkMode ? 'text-text-dark' : 'text-text'
                }`}>
                  Resume Link
                </label>
                <input
                  type="text"
                  name="resume"
                  placeholder="Enter your resume link"
                  value={formData.resume}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-background-dark border-border-dark text-text-dark placeholder-text-dark-muted' 
                      : 'bg-white border-border text-text placeholder-text-muted'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  job.hasApplied
                    ? isDarkMode
                      ? 'bg-secondary-dark text-white cursor-not-allowed'
                      : 'bg-secondary text-white cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-primary-dark text-white hover:bg-primary'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                disabled={mutation.isLoading || job.hasApplied}
              >
                {job.hasApplied
                  ? "You have already applied"
                  : mutation.isLoading
                  ? "Applying..."
                  : "Apply Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;