import Event from "../../models/event.model.js";
import User from "../../models/user.model.js";
import cloudinary from "../../lib/cloudinary.js";
import mongoose from "mongoose";

// Helper function to upload image to Cloudinary
const uploadImage = async (image) => {
  try {
    // If image is a base64 string, upload it directly
    if (typeof image === 'string' && image.startsWith('data:')) {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'event_images',
      });
      return result.secure_url;
    }
    
    // If image is a base64 string without data URI prefix, add it
    if (typeof image === 'string' && !image.startsWith('data:')) {
      const dataUri = `data:image/jpeg;base64,${image}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'event_images',
      });
      return result.secure_url;
    }
    
    // If image is a buffer from multer, upload it directly
    if (Buffer.isBuffer(image)) {
      // Fix: Use Promise to properly handle stream completion
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'event_images',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              console.error('Error in buffer upload stream:', error);
              reject(error);
              return;
            }
            resolve(result.secure_url);
          }
        );
        
        // Handle potential stream errors
        uploadStream.on('error', (error) => {
          console.error('Upload stream error:', error);
          reject(error);
        });
        
        // End the stream with the buffer
        uploadStream.end(image);
      });
    }
    
    // If image is already a URL, return it
    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
      return image;
    }
    
    throw new Error('Invalid image format');
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Create a new event with improved error handling and file processing
export const createEvent = async (req, res) => {
  try {
    console.log("Received event creation request");
    
    // Track if we uploaded any images to Cloudinary (for cleanup if needed)
    const uploadedImages = [];
    
    // Helper to upload images to Cloudinary
    const uploadToCloudinary = async (buffer, folder = 'event_images') => {
      try {
        if (!buffer || buffer.length === 0) {
          throw new Error('Empty image buffer');
        }
        
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'auto',
              quality: 'auto:low',
              fetch_format: 'auto',
              height: 1000,
              width: 1000,
              crop: 'limit',
              transformation: [
                { quality: 'auto:low' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Error in upload stream:', error);
                reject(error);
                return;
              }
              
              // Track this successful upload
              uploadedImages.push(result.public_id);
              resolve(result.secure_url);
            }
          );
          
          // Handle potential stream errors
          uploadStream.on('error', (error) => {
            console.error('Upload stream error:', error);
            reject(error);
          });
          
          // Send the buffer to the stream
          uploadStream.end(buffer);
        });
      } catch (error) {
        console.error('Error in uploadToCloudinary:', error);
        throw error;
      }
    };
    
    // Extract fields from request body
    const {
      title,
      description,
      detailedDescription,
      date,
      time,
      endTime,
      locationType,
      onlineLink,
      physicalLocation,
      category
    } = req.body;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'category', 'locationType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate category
    const validCategories = [
      'Networking',
      'Mentorship',
      'Workshops',
      'Social',
      'Alumni Meetups',
      'Webinars',
      'Others'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }
    
    // Parse speakers and agenda if present
    let speakers = [];
    let agenda = [];
    
    try {
      if (req.body.speakers) {
        speakers = typeof req.body.speakers === 'string' 
          ? JSON.parse(req.body.speakers) 
          : req.body.speakers;
      }
      
      if (req.body.agenda) {
        agenda = typeof req.body.agenda === 'string'
          ? JSON.parse(req.body.agenda)
          : req.body.agenda;
      }
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data in speakers or agenda"
      });
    }
    
    // Process the banner image if provided
    let bannerImgUrl = '';
    const bannerImgFile = req.files?.find(file => file.fieldname === 'bannerImg');
    
    if (bannerImgFile) {
      try {
        console.log("Uploading banner image...");
        bannerImgUrl = await uploadToCloudinary(bannerImgFile.buffer);
        console.log("Banner image uploaded:", bannerImgUrl);
      } catch (error) {
        console.error("Failed to upload banner image:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload banner image"
        });
      }
    }
    
    // Process speaker images
    const processedSpeakers = await Promise.all(
      speakers.map(async (speaker, index) => {
        // Validate speaker data
        if (!speaker.name) {
          throw new Error('Speaker name is required');
        }
        
        // If speaker already has an image URL, keep it
        if (speaker.image && typeof speaker.image === 'string' && 
            (speaker.image.startsWith('http://') || speaker.image.startsWith('https://'))) {
          return speaker;
        }
        
        // Look for speaker image in uploaded files
        // Note the new format: speakerImage_0, speakerImage_1, etc.
        const speakerImgFile = req.files?.find(file => 
          file.fieldname === `speakerImage_${index}`
        );
        
        if (speakerImgFile) {
          try {
            console.log(`Uploading image for speaker ${index + 1}...`);
            const imageUrl = await uploadToCloudinary(
              speakerImgFile.buffer, 
              'speaker_images'
            );
            console.log(`Speaker ${index + 1} image uploaded:`, imageUrl);
            return { ...speaker, image: imageUrl };
          } catch (error) {
            console.error(`Error uploading image for speaker ${index + 1}:`, error);
            // Continue without the image rather than failing the whole request
            return speaker;
          }
        }
        
        return speaker;
      })
    );
    
    // Create and save the new event
    const newEvent = new Event({
      title,
      description,
      detailedDescription,
      date,
      time,
      endTime,
      locationType,
      onlineLink,
      physicalLocation,
      category,
      speakers: processedSpeakers,
      agenda,
      bannerImg: bannerImgUrl,
      createdBy: req.user._id,
      status: 'published' // Always set as published
    });
    
    await newEvent.save();
    console.log("Event created successfully:", newEvent._id);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // We could add code here to delete any uploaded images if the event creation fails
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

// Get all events (with filters)
export const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category,
      status,
      userId,
      admin = false
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    // If admin flag is true and user is admin, apply direct status filter
    const isAdminRequest = admin === 'true' && req.user && req.user.role === 'admin';

    // Handle authorization and status filter simultaneously
    if (isAdminRequest) {
      // Admin specific view - apply status filter directly
      if (status) {
        query.status = status;
      }
    } else if (req.user && req.user.role === 'admin') {
      // Admin can see all events, so apply status filter directly if provided
      if (status) {
        query.status = status;
      }
    } else if (req.user) {
      // Regular authenticated user
      if (status) {
        // When a specific status is requested, the user can only see:
        // 1. Their own events with that status
        // 2. Published events if status === 'published'
        if (status === 'published') {
          query.status = 'published';
        } else {
          // For other statuses, only show their own events
          query.status = status;
          query.createdBy = req.user._id;
        }
      } else {
        // When no status is specified, show published events or their own events
        query.$or = [
          { status: 'published' },
          { createdBy: req.user._id }
        ];
      }
    } else {
      // Unauthenticated user - only show published events regardless of status filter
      query.status = 'published';
    }

    // If userId is provided, filter by createdBy (this overrides previous createdBy filters)
    if (userId) {
      query.createdBy = userId;
    }

    console.log('Event query:', JSON.stringify(query, null, 2));

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1 },
      populate: 'createdBy',
    };

    const events = await Event.paginate(query, options);

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
};

// Get single event
export const getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email profilePicture')
      .populate({
        path: 'participants.user',
        select: 'name email profilePicture'
      })
      .populate({
        path: 'comments.user',
        select: 'name email profilePicture'
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user can view the event - handle unauthenticated case
    if (event.status !== 'published' && req.user) {
      // Only do these additional checks if req.user exists and event is not published
      if (event.createdBy._id.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this event',
        });
      }
    } else if (event.status !== 'published' && !req.user) {
      // If no user is authenticated and event is not published, return 401
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view this event',
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error("Error in getEventDetails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get event details"
    });
  }
};

// Update an event with improved handling
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find the event first to check if it exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Make sure the user is authorized to update this event
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event"
      });
    }
    
    // Track uploaded images for possible cleanup
    const uploadedImages = [];
    
    // Helper to upload images to Cloudinary
    const uploadToCloudinary = async (buffer, folder = 'event_images') => {
      try {
        if (!buffer || buffer.length === 0) {
          throw new Error('Empty image buffer');
        }
        
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'auto',
              quality: 'auto:low',
              fetch_format: 'auto',
              height: 1000,
              width: 1000,
              crop: 'limit',
              transformation: [
                { quality: 'auto:low' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Error in upload stream:', error);
                reject(error);
                return;
              }
              
              // Track this successful upload
              uploadedImages.push(result.public_id);
              resolve(result.secure_url);
            }
          );
          
          // Handle potential stream errors
          uploadStream.on('error', (error) => {
            console.error('Upload stream error:', error);
            reject(error);
          });
          
          // Send the buffer to the stream
          uploadStream.end(buffer);
        });
      } catch (error) {
        console.error('Error in uploadToCloudinary:', error);
        throw error;
      }
    };
    
    // Extract fields from request
    const {
      title,
      description,
      detailedDescription,
      date,
      time,
      endTime,
      locationType,
      onlineLink,
      physicalLocation,
      category,
      eventType,
      status,
      existingBannerImg
    } = req.body;
    
    // Parse speakers and agenda if present
    let speakers = [];
    let agenda = [];
    
    try {
      if (req.body.speakers) {
        speakers = typeof req.body.speakers === 'string' 
          ? JSON.parse(req.body.speakers) 
          : req.body.speakers;
      }
      
      if (req.body.agenda) {
        agenda = typeof req.body.agenda === 'string'
          ? JSON.parse(req.body.agenda)
          : req.body.agenda;
      }
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data in speakers or agenda"
      });
    }
    
    // Process the banner image
    let bannerImgUrl = event.bannerImg; // Default to existing image
    
    // Check if we need to update the banner image
    const bannerImgFile = req.files?.find(file => file.fieldname === 'bannerImg');
    
    if (bannerImgFile) {
      try {
        console.log("Uploading new banner image...");
        bannerImgUrl = await uploadToCloudinary(bannerImgFile.buffer);
        console.log("New banner image uploaded:", bannerImgUrl);
      } catch (error) {
        console.error("Failed to upload banner image:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload banner image"
        });
      }
    } else if (existingBannerImg) {
      // If client explicitly provided an existing banner URL
      bannerImgUrl = existingBannerImg;
    }
    
    // Process speaker images
    const processedSpeakers = await Promise.all(
      speakers.map(async (speaker, index) => {
        // Skip invalid speakers
        if (!speaker.name) {
          return null;
        }
        
        // If speaker already has an image URL, keep it
        if (speaker.image && typeof speaker.image === 'string' && 
            (speaker.image.startsWith('http://') || speaker.image.startsWith('https://'))) {
          return speaker;
        }
        
        // Look for new speaker image in uploaded files
        const speakerImgFile = req.files?.find(file => 
          file.fieldname === `speakerImage_${index}`
        );
        
        if (speakerImgFile) {
          try {
            console.log(`Uploading image for speaker ${index + 1}...`);
            const imageUrl = await uploadToCloudinary(
              speakerImgFile.buffer, 
              'speaker_images'
            );
            console.log(`Speaker ${index + 1} image uploaded:`, imageUrl);
            return { ...speaker, image: imageUrl };
          } catch (error) {
            console.error(`Error uploading image for speaker ${index + 1}:`, error);
            // Continue without the image rather than failing the whole request
            return speaker;
          }
        }
        
        return speaker;
      })
    ).then(speakers => speakers.filter(Boolean)); // Remove any null entries
    
    // Build the updated event object
    const updatedEventData = {
      title,
      description,
      detailedDescription,
      date,
      time,
      endTime,
      locationType,
      onlineLink,
      physicalLocation,
      category,
      eventType,
      speakers: processedSpeakers,
      agenda,
      bannerImg: bannerImgUrl,
      status: status || event.status,
    };
    
    // Update only fields that are provided
    Object.keys(updatedEventData).forEach(key => {
      if (updatedEventData[key] === undefined) {
        delete updatedEventData[key];
      }
    });
    
    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updatedEventData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent
    });
  } catch (error) {
    console.error("Error updating event:", error);
    
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Check if user has permission to delete
    if (event.createdBy.toString() !== req.user._id.toString() && 
      !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this event"
      });
    }
    
    // Delete the event
    await Event.findByIdAndDelete(eventId);
    
    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message
    });
  }
};

// Register for event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user is already registered
    const isRegistered = event.participants.some(p => p.user.toString() === userId.toString());
    if (isRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event"
      });
    }

    // Add user to participants with registration date
    event.participants.push({
      user: userId,
      registrationDate: new Date()
    });

    await event.save();

    // Return updated event with populated participants
    const updatedEvent = await Event.findById(eventId)
      .populate({
        path: 'participants.user',
        select: 'name email profilePicture'
      });

    res.status(200).json({
      success: true,
      message: "Successfully registered for the event",
      event: updatedEvent
    });
  } catch (error) {
    console.error("Error in registerForEvent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register for event"
    });
  }
};

// Get event participants
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate({
        path: 'participants.user',
        select: 'name email profilePicture'
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user can view participants
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view participants',
      });
    }

    res.status(200).json({
      success: true,
      participants: event.participants,
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participants',
    });
  }
};

// Add comment to event
export const addEventComment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required"
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user can comment on the event
    if (event.status !== 'published' &&
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to comment on this event"
      });
    }

    // Add the comment
    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    if (!event.comments) {
      event.comments = [];
    }

    event.comments.push(comment);
    await event.save();

    // Populate the user details for the new comment
    const populatedEvent = await Event.findById(eventId)
      .populate('comments.user', 'name profilePicture');

    const newComment = populatedEvent.comments[populatedEvent.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message
    });
  }
};