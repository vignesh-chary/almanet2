import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";

const MyAppliedJobs = () => {
  const { isLoading, error, data: jobs = [] } = useQuery({
    queryKey: ["appliedJobs"],
    queryFn: async () => {
      const response = await axiosInstance.get("/jobs/applied");
      return response.data;
    },
  });

  if (isLoading) return <div>Loading applied jobs...</div>;
  if (error) return <div>Error fetching applied jobs: {error.message}</div>;

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-xl font-bold">My Applied Jobs</h1>
      {jobs.length === 0 ? (
        <p>You have not applied for any jobs yet.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.jobId} className="p-4 bg-white rounded shadow my-2">
            <h3 className="font-semibold">{job.title}</h3>
            <p>Location: {job.location}</p>
            <p>Type: {job.jobType}</p>
            <p className="font-semibold">
              Status:{" "}
              <span
                className={
                  job.status === "Accepted"
                    ? "text-green-600"
                    : job.status === "Rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }
              >
                {job.status}
              </span>
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyAppliedJobs;