import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { Briefcase, Clock, Plus, Trash2, Loader2, LinkedinIcon, X, CheckCircle } from "lucide-react";

const industryOptions = ["Tech", "Healthcare", "Finance", "Education", "Marketing", "Engineering"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MentorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    expertise: [],
    industry: "",
    availability: [],
    bio: "",
    linkedin: "",
  });

  const [newExpertise, setNewExpertise] = useState("");
  const [newAvailability, setNewAvailability] = useState({ day: "", startTime: "", endTime: "" });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/mentorships/register", formData);
      return response.data;
    },
    onSuccess: () => {
      alert("Mentor profile created successfully!");
      navigate("/mentorship-dashboard");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Error registering as a mentor");
    },
  });

  const validateForm = () => {
    let newErrors = {};
    if (formData.expertise.length === 0) newErrors.expertise = "At least one expertise is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (formData.availability.length === 0) newErrors.availability = "At least one availability slot is required";
    if (!formData.bio || formData.bio.length < 20) newErrors.bio = "Bio must be at least 20 characters";
    if (formData.linkedin && !formData.linkedin.startsWith("https://www.linkedin.com/")) {
      newErrors.linkedin = "Enter a valid LinkedIn profile URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleExpertiseAdd = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise)) {
      setFormData({ ...formData, expertise: [...formData.expertise, newExpertise] });
      setNewExpertise("");
    }
  };

  const handleExpertiseRemove = (index) => {
    const updatedExpertise = [...formData.expertise];
    updatedExpertise.splice(index, 1);
    setFormData({ ...formData, expertise: updatedExpertise });
  };

  const handleAvailabilityAdd = () => {
    if (newAvailability.day && newAvailability.startTime && newAvailability.endTime) {
      setFormData({ ...formData, availability: [...formData.availability, newAvailability] });
      setNewAvailability({ day: "", startTime: "", endTime: "" });
    }
  };

  const handleAvailabilityRemove = (index) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability.splice(index, 1);
    setFormData({ ...formData, availability: updatedAvailability });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card dark:bg-card-dark rounded-xl shadow-soft dark:shadow-card border border-border dark:border-border-dark p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text dark:text-text-dark">
            Become a Mentor
          </h2>
          <p className="text-text-muted dark:text-text-dark-muted mt-2">
            Guide and inspire the next generation of professionals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expertise Field */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
              Areas of Expertise
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g., Data Science, Machine Learning"
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
              />
              <button
                type="button"
                onClick={handleExpertiseAdd}
                className="px-4 py-2.5 bg-secondary dark:bg-secondary-dark text-primary dark:text-primary-dark rounded-lg hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>
            {errors.expertise && (
              <p className="mt-1.5 text-sm text-error dark:text-error-dark flex items-center gap-1">
                <X size={14} />
                {errors.expertise}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.expertise.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark rounded-lg"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleExpertiseRemove(index)}
                    className="text-text-muted dark:text-text-dark-muted hover:text-error dark:hover:text-error-dark transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Industry Field */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
              Industry
            </label>
            <div className="relative">
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all appearance-none pr-10 text-text dark:text-text-dark"
              >
                <option value="" disabled>Select your industry</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              <Briefcase size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-dark-muted pointer-events-none" />
            </div>
            {errors.industry && (
              <p className="mt-1.5 text-sm text-error dark:text-error-dark flex items-center gap-1">
                <X size={14} />
                {errors.industry}
              </p>
            )}
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
              Professional Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Share your professional journey, expertise, and what you can offer as a mentor (min 20 characters)"
              className="w-full px-4 py-3 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all resize-none h-32 text-text dark:text-text-dark"
            />
            {errors.bio && (
              <p className="mt-1.5 text-sm text-error dark:text-error-dark flex items-center gap-1">
                <X size={14} />
                {errors.bio}
              </p>
            )}
          </div>

          {/* Availability Field */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
              Weekly Availability
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={newAvailability.day}
                onChange={(e) => setNewAvailability({ ...newAvailability, day: e.target.value })}
                className="px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
              >
                <option value="" disabled>Select day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={newAvailability.startTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                  className="px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
                />
                <span className="text-text-muted dark:text-text-dark-muted">to</span>
                <input
                  type="time"
                  value={newAvailability.endTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                  className="px-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
                />
              </div>
              <button
                type="button"
                onClick={handleAvailabilityAdd}
                className="px-4 py-2.5 bg-secondary dark:bg-secondary-dark text-primary dark:text-primary-dark rounded-lg hover:bg-secondary/80 dark:hover:bg-secondary-dark/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Add Slot</span>
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {formData.availability.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 bg-secondary dark:bg-secondary-dark rounded-lg"
                >
                  <div className="flex items-center gap-2 text-text dark:text-text-dark">
                    <Clock size={16} className="text-primary dark:text-primary-dark" />
                    <span>{slot.day}: {slot.startTime} - {slot.endTime}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAvailabilityRemove(index)}
                    className="text-text-muted dark:text-text-dark-muted hover:text-error dark:hover:text-error-dark transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {errors.availability && (
              <p className="mt-1.5 text-sm text-error dark:text-error-dark flex items-center gap-1">
                <X size={14} />
                {errors.availability}
              </p>
            )}
          </div>

          {/* LinkedIn Profile URL Field */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
              LinkedIn Profile
            </label>
            <div className="relative">
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://www.linkedin.com/in/your-profile"
                className="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary-dark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all text-text dark:text-text-dark"
              />
              <LinkedinIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-dark-muted" />
            </div>
            {errors.linkedin && (
              <p className="mt-1.5 text-sm text-error dark:text-error-dark flex items-center gap-1">
                <X size={14} />
                {errors.linkedin}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full py-3 px-4 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
          >
            {mutation.isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Register as Mentor</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MentorRegister;
