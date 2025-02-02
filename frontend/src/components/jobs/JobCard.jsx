import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h2>
      <p className="text-gray-600">{job.location}</p>
      <p className="text-sm text-gray-500 mt-2">{job.jobType}</p>
      <Link
        to={`/jobs/${job._id}`}
        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        View Details
      </Link>
    </div>
  );
};

export default JobCard;
