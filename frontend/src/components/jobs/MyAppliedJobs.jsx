import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { axiosInstance } from "../../lib/axios";
import { Briefcase, MapPin, Clock, CheckCircle2, XCircle, Clock4, AlertCircle, Building2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

const MyAppliedJobs = () => {
  const { isDarkMode } = useTheme();
  const { isLoading, error, data: jobs = [] } = useQuery({
    queryKey: ["appliedJobs"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/jobs/applied");
        console.log("Fetched applied jobs:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
        toast.error("Failed to fetch your job applications");
        throw error;
      }
    },
    retry: 1,
  });

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle className="w-5 h-5 text-gray-500" />;
    
    switch (status.toLowerCase()) {
      case "accepted":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-error" />;
      case "pending":
        return <Clock4 className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";
    
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-success/10 text-success border-success/20 hover:bg-success/20";
      case "rejected":
        return "bg-error/10 text-error border-error/20 hover:bg-error/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  const formatInterviewDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting interview date:', error);
      return null;
    }
  };

  if (isLoading) return (
    <div className={`flex justify-center items-center min-h-screen ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className={`w-12 h-12 border-4 ${
        isDarkMode ? 'border-primary-dark' : 'border-primary'
      } border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );

  if (error) return (
    <div className={`p-6 ${
      isDarkMode ? 'bg-background-dark text-text-dark' : 'bg-background text-text'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className={`p-4 rounded-xl ${
          isDarkMode ? 'bg-error-dark/10 text-error-dark' : 'bg-error/10 text-error'
        }`}>
          <p className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Error fetching applied jobs: {error.message}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-6 ${
      isDarkMode ? 'bg-background-dark' : 'bg-background'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              My Applications
            </h1>
            <p className={`${
              isDarkMode ? 'text-text-dark/60' : 'text-text/60'
            }`}>
              Track your job application status
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl ${
            isDarkMode ? 'bg-card-dark border border-border-dark' : 'bg-white border border-border'
          } shadow-sm`}>
            <span className={`font-medium ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              {jobs.length} {jobs.length === 1 ? 'Application' : 'Applications'}
            </span>
          </div>
        </div>
        
        {jobs.length === 0 ? (
          <div className={`p-12 rounded-xl text-center ${
            isDarkMode ? 'bg-card-dark border border-border-dark' : 'bg-white border border-border'
          } shadow-sm`}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-primary/5">
              <Briefcase className={`w-12 h-12 ${
                isDarkMode ? 'text-primary-dark/20' : 'text-primary/20'
              }`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              No Applications Yet
            </h3>
            <p className={`${
              isDarkMode ? 'text-text-dark/60' : 'text-text/60'
            }`}>
              Start applying to jobs to see them here
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.jobId}
                className={`p-6 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-card-dark border border-border-dark hover:bg-card-dark/80 hover:shadow-lg' 
                    : 'bg-white border border-border hover:bg-gray-50 hover:shadow-lg'
                } shadow-sm`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${
                        isDarkMode ? 'text-text-dark' : 'text-text'
                      }`}>
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        <div className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-primary-dark' : 'text-primary'
                        }`}>
                          <Building2 className="w-4 h-4" />
                          <span>{job.company || 'Company not specified'}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-text-dark/80' : 'text-text/80'
                        }`}>
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-text-dark/80' : 'text-text/80'
                        }`}>
                          <Briefcase className="w-4 h-4" />
                          <span>{job.jobType}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors duration-200 ${
                      getStatusColor(job.status)
                    }`}>
                      {getStatusIcon(job.status)}
                      <span className="font-medium capitalize">{job.status || 'Pending'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${
                      isDarkMode ? 'text-text-dark/60' : 'text-text/60'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span>Applied {formatDate(job.appliedAt)}</span>
                    </div>
                    {job.interviewDate && formatInterviewDate(job.interviewDate) && (
                      <div className={`flex items-center gap-2 ${
                        isDarkMode ? 'text-primary-dark' : 'text-primary'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>Interview: {formatInterviewDate(job.interviewDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppliedJobs;