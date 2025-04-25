import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Image as ImageIcon, Plus, Trash2, Loader2, X, Upload } from "lucide-react";
import styles from "../../styles/EventImage.module.css";
import "lazysizes";

// Image compression utility
const compressImage = async (file, maxSizeMB = 1) => {
  // If file is already smaller than the max size, return it as is
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1000; // Reduced from 1200 to create smaller images
        if (width > height && width > maxDimension) {
          height = Math.round(height * maxDimension / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round(width * maxDimension / height);
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality adjustment
        canvas.toBlob((blob) => {
          // Create a new file from the blob
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(newFile);
        }, 'image/jpeg', 0.6); // Reduced quality from 0.7 to 0.6 for smaller files
      };
    };
  });
};

const EventForm = ({ onSubmit, isLoading, initialValues = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    detailedDescription: "",
    date: "",
    time: "",
    endTime: "",
    locationType: "offline",
    onlineLink: "",
    physicalLocation: "",
    category: "",
    speakers: [],
    agenda: [],
    bannerImg: null,
    status: "published",
  });

  const [bannerPreview, setBannerPreview] = useState(null);
  const [speakerPreviews, setSpeakerPreviews] = useState({});
  const [processingFiles, setProcessingFiles] = useState(false);

  // Initialize form with initial values if provided
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
      
      // Set banner preview if exists
      if (initialValues.bannerImg) {
        setBannerPreview(initialValues.bannerImg);
      }
      
      // Set speaker previews if they exist
      if (initialValues.speakers && initialValues.speakers.length > 0) {
        const previews = {};
        initialValues.speakers.forEach((speaker, index) => {
          if (speaker.image) {
            previews[index] = speaker.image;
          }
        });
        setSpeakerPreviews(previews);
      }
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      if (files && files[0]) {
        // Handle image upload
        setProcessingFiles(true);
        
        compressImage(files[0])
          .then(compressedFile => {
            setFormData(prev => ({ ...prev, [name]: compressedFile }));
            
            // Generate preview URL
            if (name === "bannerImg") {
              setBannerPreview(URL.createObjectURL(compressedFile));
            }
            
            setProcessingFiles(false);
          })
          .catch(error => {
            console.error("Error compressing image:", error);
            setProcessingFiles(false);
          });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpeakerChange = (index, field, value) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index] = { ...updatedSpeakers[index], [field]: value };
    setFormData(prev => ({ ...prev, speakers: updatedSpeakers }));
  };

  const handleSpeakerImageChange = async (index, file) => {
    if (!file) return;
    
    setProcessingFiles(true);
    
    try {
      const compressedFile = await compressImage(file, 0.5); // Limit speaker images to 0.5MB
      
      const updatedSpeakers = [...formData.speakers];
      updatedSpeakers[index] = { ...updatedSpeakers[index], image: compressedFile };
      
      setFormData(prev => ({ ...prev, speakers: updatedSpeakers }));
      setSpeakerPreviews(prev => ({
        ...prev,
        [index]: URL.createObjectURL(compressedFile)
      }));
    } catch (error) {
      console.error("Error processing speaker image:", error);
    } finally {
      setProcessingFiles(false);
    }
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, { name: "", role: "", image: null }]
    }));
  };

  const removeSpeaker = (index) => {
    // Clean up preview URL to avoid memory leaks
    if (speakerPreviews[index] && speakerPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(speakerPreviews[index]);
    }
    
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
    
    setSpeakerPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
  };

  const handleAgendaChange = (index, field, value) => {
    const updatedAgenda = [...formData.agenda];
    updatedAgenda[index] = { ...updatedAgenda[index], [field]: value };
    setFormData(prev => ({ ...prev, agenda: updatedAgenda }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { time: "", title: "", description: "" }]
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'category'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate location based on location type
    if (formData.locationType === 'online' && !formData.onlineLink) {
      alert('Please provide an online link for online events');
      return;
    }
    
    if (formData.locationType === 'offline' && !formData.physicalLocation) {
      alert('Please provide a physical location for offline events');
      return;
    }
    
    if (formData.locationType === 'hybrid' && 
        (!formData.onlineLink || !formData.physicalLocation)) {
      alert('Hybrid events require both an online link and physical location');
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up banner preview
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
      }
      
      // Clean up speaker previews
      Object.values(speakerPreviews).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [bannerPreview, speakerPreviews]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
              Title <span className="text-error dark:text-error-dark">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
              Category <span className="text-error dark:text-error-dark">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              <option value="Networking">Networking</option>
              <option value="Mentorship">Mentorship</option>
              <option value="Workshops">Workshops</option>
              <option value="Social">Social</option>
              <option value="Alumni Meetups">Alumni Meetups</option>
              <option value="Webinars">Webinars</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
            Description <span className="text-error dark:text-error-dark">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
            Detailed Description
          </label>
          <textarea
            name="detailedDescription"
            value={formData.detailedDescription}
            onChange={handleChange}
            className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            rows="5"
          />
        </div>
      </div>

      {/* Date and Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">Date and Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
              Date <span className="text-error dark:text-error-dark">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
              Start Time <span className="text-error dark:text-error-dark">*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
              End Time <span className="text-error dark:text-error-dark">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">Location</h3>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
            Location Type <span className="text-error dark:text-error-dark">*</span>
          </label>
          <select
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            required
            className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {formData.locationType !== "offline" && (
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
              Online Link
              {formData.locationType !== "hybrid" && <span className="text-error dark:text-error-dark">*</span>}
            </label>
            <input
              type="url"
              name="onlineLink"
              value={formData.onlineLink}
              onChange={handleChange}
              required={formData.locationType === "online"}
              className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              placeholder="https://zoom.us/j/example"
            />
          </div>
        )}

        {formData.locationType !== "online" && (
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">
              Physical Location
              {formData.locationType !== "hybrid" && <span className="text-error dark:text-error-dark">*</span>}
            </label>
            <input
              type="text"
              name="physicalLocation"
              value={formData.physicalLocation}
              onChange={handleChange}
              required={formData.locationType === "offline"}
              className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              placeholder="Building name, room number, address, etc."
            />
          </div>
        )}
      </div>

      {/* Banner Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">Banner Image</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-48 h-32 border-2 border-dashed border-border dark:border-border-dark rounded-lg flex items-center justify-center overflow-hidden">
            {bannerPreview ? (
              <>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (bannerPreview.startsWith('blob:')) {
                      URL.revokeObjectURL(bannerPreview);
                    }
                    setBannerPreview(null);
                    setFormData(prev => ({ ...prev, bannerImg: null }));
                  }}
                  className="absolute top-1 right-1 bg-error dark:bg-error-dark text-white rounded-full p-1 hover:bg-error-dark dark:hover:bg-error transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-accent dark:text-accent-dark" />
                <span className="mt-2 block text-sm text-text-muted dark:text-text-dark-muted">Upload banner</span>
              </div>
            )}
            <input
              type="file"
              name="bannerImg"
              onChange={handleChange}
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={processingFiles}
            />
          </div>
          <div className="text-sm text-text-muted dark:text-text-dark-muted">
            <p>Recommended size: 1200 × 400 pixels</p>
            <p>Max size: 4MB</p>
          </div>
        </div>
      </div>

      {/* Speakers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text dark:text-text-dark">Speakers</h3>
          <button
            type="button"
            onClick={addSpeaker}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
            disabled={processingFiles}
          >
            <Plus size={16} />
            Add Speaker
          </button>
        </div>
        {formData.speakers.map((speaker, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded">
            <div>
              <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Name</label>
              <input
                type="text"
                value={speaker.name || ""}
                onChange={(e) => handleSpeakerChange(index, "name", e.target.value)}
                className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Role</label>
              <input
                type="text"
                value={speaker.role || ""}
                onChange={(e) => handleSpeakerChange(index, "role", e.target.value)}
                className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Image</label>
                <div className="relative w-20 h-20 border-2 border-dashed border-border dark:border-border-dark rounded-lg flex items-center justify-center overflow-hidden">
                  {speakerPreviews[index] ? (
                    <>
                      <img
                        src={speakerPreviews[index]}
                        alt={`Speaker ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (speakerPreviews[index].startsWith('blob:')) {
                            URL.revokeObjectURL(speakerPreviews[index]);
                          }
                          
                          const updatedSpeakers = [...formData.speakers];
                          updatedSpeakers[index] = { ...updatedSpeakers[index], image: null };
                          setFormData(prev => ({ ...prev, speakers: updatedSpeakers }));
                          
                          setSpeakerPreviews(prev => {
                            const newPreviews = { ...prev };
                            delete newPreviews[index];
                            return newPreviews;
                          });
                        }}
                        className="absolute top-0 right-0 bg-error dark:bg-error-dark text-white rounded-full p-1 hover:bg-error-dark dark:hover:bg-error transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <Upload className="h-6 w-6 text-accent dark:text-accent-dark" />
                  )}
                  <input
                    type="file"
                    onChange={(e) => handleSpeakerImageChange(index, e.target.files[0])}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={processingFiles}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSpeaker(index)}
                className="p-2 text-error dark:text-error-dark hover:text-primary dark:hover:text-primary-dark"
                disabled={processingFiles}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agenda */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text dark:text-text-dark">Agenda</h3>
          <button
            type="button"
            onClick={addAgendaItem}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
        {formData.agenda.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded">
            <div>
              <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Time</label>
              <input
                type="time"
                value={item.time || ""}
                onChange={(e) => handleAgendaChange(index, "time", e.target.value)}
                className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Title</label>
              <input
                type="text"
                value={item.title || ""}
                onChange={(e) => handleAgendaChange(index, "title", e.target.value)}
                className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Description</label>
                <input
                  type="text"
                  value={item.description || ""}
                  onChange={(e) => handleAgendaChange(index, "description", e.target.value)}
                  className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark text-text dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => removeAgendaItem(index)}
                className="p-2 text-error dark:text-error-dark hover:text-primary dark:hover:text-primary-dark"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-text dark:text-text-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || processingFiles}
          className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading || processingFiles ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              {processingFiles ? "Processing Images..." : "Saving..."}
            </>
          ) : (
            "Create Event"
          )}
        </button>
      </div>
    </form>
  );
};

export default EventForm;