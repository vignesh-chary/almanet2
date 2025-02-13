import React, { useState } from "react";
import { axiosInstance } from "../../lib/axios";

const MentorshipRequestForm = ({ mentorId, onClose, onRequest }) => {
  const [step, setStep] = useState(1);
  const [mentorshipType, setMentorshipType] = useState("");
  const [goals, setGoals] = useState("");
  const [message, setMessage] = useState("");

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const requestData = {
      mentorId,
      message,
      mentorshipType,
    };

    try {
      await axiosInstance.post("/mentorships/request", requestData);
      onRequest(requestData); // Update UI
      alert("Mentorship request sent successfully!");
    } catch (error) {
      alert("Error sending request. Try again!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between">
          <p className="text-gray-600 text-sm">Step {step} of 4</p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>
        <div className="h-2 bg-gray-200 rounded mt-2 mb-4">
          <div className="h-2 bg-black rounded" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* Step 1: Select Mentorship Type */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-2">What type of mentorship are you seeking?</h2>
            <select
              className="w-full p-3 border rounded-lg"
              value={mentorshipType}
              onChange={(e) => setMentorshipType(e.target.value)}
            >
              <option value="">Select one</option>
              <option value="Resume Review">Resume Review</option>
              <option value="Career Guidance">Career Guidance</option>
              <option value="Technical Skills">Technical Skills</option>
            </select>
          </>
        )}

        {/* Step 2: Describe Goals */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-2">Describe your goals</h2>
            <textarea
              className="w-full p-3 border rounded-lg h-24"
              placeholder="I want to improve my resume for software engineering roles..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            ></textarea>
          </>
        )}

        {/* Step 3: Write a Message to the Mentor */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-2">Why do you want this mentor?</h2>
            <textarea
              className="w-full p-3 border rounded-lg h-24"
              placeholder="I'm impressed with your experience in XYZ and would love your guidance."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </>
        )}

        {/* Step 4: Confirm and Submit */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-bold mb-2">Confirm Your Request</h2>
            <p><strong>Mentorship Type:</strong> {mentorshipType}</p>
            <p><strong>Your Goals:</strong> {goals}</p>
            <p><strong>Your Message:</strong> {message}</p>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          {step > 1 && (
            <button onClick={handleBack} className="px-4 py-2 bg-gray-300 rounded-lg">
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorshipRequestForm;