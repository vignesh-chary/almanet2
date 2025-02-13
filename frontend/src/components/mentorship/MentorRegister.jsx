import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { FaLinkedin, FaTrashAlt } from "react-icons/fa";

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
    <div className="max-w-xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">Become a Mentor</h2>
      <p className="text-gray-500 text-center mb-4">Guide and inspire the next generation of professionals.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Expertise Field */}
        <div>
          <label className="block text-gray-700 font-medium">Expertise</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g., Data Science"
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              className="input input-bordered w-full"
            />
            <button type="button" className="btn btn-success" onClick={handleExpertiseAdd}>
              Add
            </button>
          </div>
          {errors.expertise && <p className="text-red-500 text-sm mt-1">{errors.expertise}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.expertise.map((item, index) => (
              <span key={index} className="badge badge-outline">
                {item} <FaTrashAlt className="ml-2 cursor-pointer text-red-500" onClick={() => handleExpertiseRemove(index)} />
              </span>
            ))}
          </div>
        </div>

        {/* Industry Field */}
        <div>
          <label className="block text-gray-700 font-medium">Industry</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="" disabled>Select industry</option>
            {industryOptions.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
        </div>

        {/* Bio Field */}
        <div>
          <label className="block text-gray-700 font-medium">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Write a short bio about yourself (min 20 characters)"
            className="textarea textarea-bordered w-full"
          />
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
        </div>

        {/* Availability Field */}
        <div>
          <label className="block text-gray-700 font-medium">Availability</label>
          <div className="flex items-center gap-2">
            <select value={newAvailability.day} onChange={(e) => setNewAvailability({ ...newAvailability, day: e.target.value })} className="select select-bordered">
              <option value="" disabled>Select day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input type="time" value={newAvailability.startTime} onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })} className="input input-bordered" />
            <input type="time" value={newAvailability.endTime} onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })} className="input input-bordered" />
            <button type="button" className="btn btn-success" onClick={handleAvailabilityAdd}>
              Add
            </button>
          </div>
          <div className="mt-2">
            {formData.availability.map((slot, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <span>{slot.day}: {slot.startTime} - {slot.endTime}</span>
                <FaTrashAlt className="text-red-500 cursor-pointer" onClick={() => handleAvailabilityRemove(index)} />
              </div>
            ))}
          </div>
          {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
        </div>
        {/* LinkedIn Profile URL Field */}
        <div>
          <label className="block text-gray-700 font-medium">LinkedIn Profile</label>
          <div className="flex items-center">
            <FaLinkedin className="text-blue-500 text-2xl mr-2" />
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/your-profile"
              className="input input-bordered w-full"
            />
          </div>
          {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full">
          {mutation.isLoading ? "Submitting..." : "Register as Mentor"}
        </button>
      </form>
    </div>
  );
};

export default MentorRegister;
