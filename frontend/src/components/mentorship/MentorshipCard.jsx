import React from "react";

const MentorshipCard = ({ title, description, buttonText, imageUrl, link, disabled }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="p-6 md:w-2/3">
          <h3 className="text-xl font-bold text-[#0d131c] mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <a
            href={disabled ? "#" : link}
            className={`inline-block px-6 py-2 rounded-md transition-colors ${
              disabled
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={(e) => disabled && e.preventDefault()} // Prevent click if disabled
          >
            {disabled ? "Already Registered" : buttonText}
          </a>
        </div>
      </div>
    </div>
  );
};

export default MentorshipCard;
