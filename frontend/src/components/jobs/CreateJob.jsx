import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const jobTypes = ["Full-Time", "Part-Time", "Internship", "Contract"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: jobTypes[0],
    experienceLevel: experienceLevels[0],
    position: "",
    requirements: "",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    createJob(formData);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Job Post</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg space-y-4"
      >
        <input
          type="text"
          placeholder="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Job Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          {jobTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          name="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          {experienceLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Requirements"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLoading ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
