import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Link } from 'react-router-dom';

const RecommendedJobs = ({ isDarkMode }) => {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await axiosInstance.get("/jobs");
      return response.data.jobs || [];
    },
  });

  // Get top 3 jobs as recommendations
  const recommendedJobs = jobs.slice(0, 3);

  if (isLoading) return null;
  if (error) return null;
  if (!recommendedJobs.length) return null;

  return (
    <div className={`mb-8 p-6 rounded-xl ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <h2 className={`text-xl font-semibold mb-4 ${
        isDarkMode ? 'text-text-dark' : 'text-text'
      }`}>
        Recommended for You
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedJobs.map((job) => (
          <Link
            key={job._id}
            to={`/jobs/${job._id}`}
            className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-background-dark' : 'bg-background'
            }`}
          >
            <h3 className={`font-semibold ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              {job.title}
            </h3>
            <p className={`mt-1 ${
              isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
            }`}>
              {job.company}
            </p>
            <p className={`mt-2 ${
              isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
            }`}>
              {job.location}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedJobs; 