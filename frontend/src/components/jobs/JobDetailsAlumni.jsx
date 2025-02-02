import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const JobDetailsAlumni = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

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

  if (isLoading || applicantsLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading job details</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">{job.title}</h2>
      <p>{job.description}</p>
      <p>Location: {job.location}</p>
      <p>Job Type: {job.jobType}</p>

      <h3 className="text-lg font-semibold mt-6">Applicants</h3>
      <ul className="mt-4">
        {applicants.map((applicant) => (
          <li key={applicant.email} className="p-2 bg-gray-100 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">{applicant.name}</p>
              <a href={applicant.resume} className="text-blue-500" target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
              <p className="text-sm">
                Status:{" "}
                <span
                  className={
                    applicant.status === "Accepted"
                      ? "text-green-500"
                      : applicant.status === "Rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }
                >
                  {applicant.status || "Pending"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                onClick={() => acceptApplicant.mutate(applicant.email)}
                disabled={acceptApplicant.isLoading}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={() => rejectApplicant.mutate(applicant.email)}
                disabled={rejectApplicant.isLoading}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobDetailsAlumni;