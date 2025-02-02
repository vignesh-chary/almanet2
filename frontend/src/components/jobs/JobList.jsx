import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import JobCard from "./JobCard";

const JobList = ({ searchTerm, filters }) => {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs", searchTerm, filters],
    queryFn: async () => {
      const params = {
        search: searchTerm,
        ...filters,
      };
      const response = await axiosInstance.get("/jobs", { params });
      return response.data.jobs;
    },
  });

  if (isLoading)
    return <div className="text-center text-gray-600 mt-4">Loading jobs...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-4">Error fetching jobs</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {jobs.length > 0 ? (
        jobs.map((job) => <JobCard key={job._id} job={job} />)
      ) : (
        <div className="text-center text-gray-600 col-span-full">
          No jobs found
        </div>
      )}
    </div>
  );
};

export default JobList;
