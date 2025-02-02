import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { axiosInstance } from "../../lib/axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

const JobDetails = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ resume: "" });
  const navigate = useNavigate(); 
  const queryClient = useQueryClient(); // Get the query client

  // Fetch job details and user info
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
      // Invalidate the query to refetch job data with updated hasApplied status
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading job details</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">{job.title}</h2>
      <p>{job.description}</p>
      <p>Location: {job.location}</p>
      {/* <p>Category: {job.category}</p> */}
      <p>Job Type: {job.jobType}</p>
      <h3 className="text-lg font-semibold mt-6">Apply for this job</h3>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input
          type="text"
          name="resume"
          placeholder="Link to Resume"
          value={formData.resume}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <button
          type="submit"
          className={`btn w-full ${
            job.hasApplied ? "btn-secondary" : "btn-primary"
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
  );
};

export default JobDetails;