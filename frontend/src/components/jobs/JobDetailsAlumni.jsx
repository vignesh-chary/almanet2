import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { useTheme } from "../../context/ThemeContext";

const JobDetailsAlumni = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/jobs/${id}`);
      return response.data;
    },
  });

  // Fetch job applicants
  const { data: applicants, isLoading: applicantsLoading } = useQuery({
    queryKey: ["applicants", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/jobs/${id}/applicants`);
      return response.data;
    },
  });

  // Accept applicant mutation
  const acceptApplicant = useMutation({
    mutationFn: async (applicantEmail) => {
      await axiosInstance.post(`/jobs/${id}/applicants/${applicantEmail}`, { status: "Accepted" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applicants", id]); // Refresh applicants list
    },
  });

  // Reject applicant mutation
  const rejectApplicant = useMutation({
    mutationFn: async (applicantEmail) => {
      await axiosInstance.post(`/jobs/${id}/applicants/${applicantEmail}`, { status: "Rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applicants", id]); // Refresh applicants list
    },
  });

  if (isLoading || applicantsLoading) {
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
        <p className="text-error">Error loading job details</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className={`p-6 rounded-xl ${
          isDarkMode ? 'bg-background-dark' : 'bg-background'
        }`}>
          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              {job.title}
            </h2>
            <div className={`space-y-2 ${
              isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
            }`}>
              <p className="text-lg">{job.company}</p>
              <p>{job.location}</p>
              <p>{job.jobType}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              Job Description
            </h3>
            <p className={`${
              isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
            }`}>
              {job.description}
            </p>
          </div>

          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              Requirements
            </h3>
            <p className={`${
              isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
            }`}>
              {job.requirements}
            </p>
          </div>

          <div>
            <h3 className={`text-xl font-semibold mb-6 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              Applicants
            </h3>
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div
                  key={applicant.email}
                  className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-background-dark' : 'bg-background'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className={`font-semibold mb-2 ${
                        isDarkMode ? 'text-text-dark' : 'text-text'
                      }`}>
                        {applicant.name}
                      </p>
                      <a
                        href={applicant.resume}
                        className={`text-sm ${
                          isDarkMode ? 'text-primary-dark' : 'text-primary'
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                      <p className={`text-sm mt-2 ${
                        isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
                      }`}>
                        Status:{" "}
                        <span
                          className={
                            applicant.status === "Accepted"
                              ? "text-success"
                              : applicant.status === "Rejected"
                              ? "text-error"
                              : "text-warning"
                          }
                        >
                          {applicant.status || "Pending"}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className={`px-4 py-2 rounded-lg font-medium ${
                          isDarkMode ? 'bg-success-dark text-white' : 'bg-success text-white'
                        }`}
                        onClick={() => acceptApplicant.mutate(applicant.email)}
                        disabled={acceptApplicant.isLoading}
                      >
                        Accept
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg font-medium ${
                          isDarkMode ? 'bg-error-dark text-white' : 'bg-error text-white'
                        }`}
                        onClick={() => rejectApplicant.mutate(applicant.email)}
                        disabled={rejectApplicant.isLoading}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsAlumni;