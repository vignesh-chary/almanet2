import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

const MentorshipCard = ({ title, description, buttonText, imageUrl, link, disabled, isDarkMode }) => {
  return (
    <div className={`group rounded-xl overflow-hidden transition-all ${
      isDarkMode 
        ? 'bg-background-dark border border-border-dark' 
        : 'bg-background border border-border'
    }`}>
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-2/5 relative">
          <div className={`absolute inset-0 ${
            isDarkMode 
              ? 'bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r' 
              : 'bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r'
          } z-10`} />
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover aspect-[4/3] md:aspect-auto transition-transform duration-300 group-hover:scale-105"
          />
          {disabled && (
            <div className="absolute top-4 right-4 z-20">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                isDarkMode 
                  ? 'bg-success-dark/20 text-success-dark' 
                  : 'bg-success/20 text-success'
              }`}>
                <CheckCircle size={14} />
                Registered
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 md:w-3/5 flex flex-col">
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-3 group-hover:text-primary transition-colors ${
              isDarkMode ? 'text-text-dark' : 'text-text'
            }`}>
              {title}
            </h3>
            <p className={`leading-relaxed mb-6 ${
              isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'
            }`}>
              {description}
            </p>
          </div>
          
          <a
            href={disabled ? "#" : link}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              disabled
                ? isDarkMode
                  ? 'bg-background-dark/50 text-text-dark-muted cursor-not-allowed'
                  : 'bg-background/50 text-text-muted cursor-not-allowed'
                : isDarkMode
                  ? 'bg-primary-dark text-white hover:bg-primary'
                  : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            onClick={(e) => disabled && e.preventDefault()}
          >
            <span>{buttonText}</span>
            {!disabled && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
          </a>
        </div>
      </div>
    </div>
  );
};

export default MentorshipCard;
