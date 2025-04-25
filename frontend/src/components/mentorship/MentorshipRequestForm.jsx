import React, { useState } from "react";

const MentorshipRequestForm = ({ mentorId, mentorName, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    mentorshipType: "",
    goals: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.mentorshipType && formData.goals && formData.message;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    onSubmit({
      mentorId,
      message: formData.message,
      mentorshipType: formData.mentorshipType,
      goals: formData.goals
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-2">Request Mentorship</h2>
        <p className="text-text-muted dark:text-text-dark-muted">Send a mentorship request to {mentorName}</p>
      </div>

      <div className="space-y-4">
        {/* Mentorship Type */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            What type of mentorship are you seeking?
          </label>
          <select
            name="mentorshipType"
            value={formData.mentorshipType}
            onChange={handleChange}
            className="w-full p-3 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
            required
          >
            <option value="">Select one</option>
            <option value="Resume Review">Resume Review</option>
            <option value="Career Guidance">Career Guidance</option>
            <option value="Technical Skills">Technical Skills</option>
            <option value="Industry Insights">Industry Insights</option>
            <option value="Interview Preparation">Interview Preparation</option>
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            What are your specific goals for this mentorship?
          </label>
          <textarea
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            className="w-full p-3 border border-border dark:border-border-dark rounded-lg h-24 bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
            placeholder="E.g., I want to transition into a senior role in the next 6 months..."
            required
          ></textarea>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Why would you like to connect with this mentor?
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 border border-border dark:border-border-dark rounded-lg h-24 bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
            placeholder="E.g., Your experience in leading tech teams at scale resonates with my career goals..."
            required
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-text dark:text-text-dark bg-secondary dark:bg-secondary-dark rounded-lg hover:bg-border dark:hover:bg-border-dark transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid()}
          className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Request"}
        </button>
      </div>
    </div>
  );
};

export default MentorshipRequestForm;