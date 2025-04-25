import express from 'express';
import multer from 'multer';
import {
    getEventDetails,
    registerForEvent,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    addEventComment,
    getEventParticipants
} from '../controllers/shared/event.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import Event from '../models/event.model.js';

const router = express.Router();

// Configure multer for improved file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024, // Reduced to 3MB limit
        files: 10, // Maximum 10 files
        fieldSize: 5 * 1024 * 1024, // Reduced to 5MB field size
        fieldNameSize: 100 // Increase field name size limit
    }
}).any(); // Accept any file field

// Custom middleware to handle file uploads with better error handling
const handleUpload = (req, res, next) => {
    // Increase request size limits at Express level
    req.setTimeout(300000); // 5 minutes timeout
    
    // Process the upload
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            
            // Handle specific multer errors
            let errorMessage = 'File upload error';
            
            switch (err.code) {
                case 'LIMIT_FILE_SIZE':
                    errorMessage = 'File is too large. Maximum size is 3MB.';
                    break;
                case 'LIMIT_FILE_COUNT':
                    errorMessage = 'Too many files uploaded. Maximum is 10 files.';
                    break;
                case 'LIMIT_FIELD_KEY':
                    errorMessage = 'Field name is too long.';
                    break;
                case 'LIMIT_FIELD_VALUE': 
                    errorMessage = 'Field value is too large.';
                    break;
                case 'LIMIT_FIELD_COUNT':
                    errorMessage = 'Too many fields in the form.';
                    break;
                case 'LIMIT_UNEXPECTED_FILE':
                    errorMessage = 'Unexpected file field in the form.';
                    break;
                default:
                    errorMessage = `Upload error: ${err.message}`;
            }
            
            return res.status(400).json({
                success: false,
                message: errorMessage,
                error: err.message
            });
        } else if (err) {
            console.error('Unknown upload error:', err);
            
            // Special handling for common errors
            if (err.message && err.message.includes('Unexpected end of form')) {
                console.error('Form data might be corrupted or incomplete');
                return res.status(400).json({
                    success: false,
                    message: 'Upload was interrupted. Please try again with smaller images (under 1MB each) and fewer images overall.',
                    error: 'Form data validation failed'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Server error during file upload',
                error: err.message
            });
        }
        
        // Validate the files received
        if (req.files && req.files.length > 0) {
            // Check for valid image files
            const invalidFiles = req.files.filter(file => 
                !file.mimetype.startsWith('image/')
            );
            
            if (invalidFiles.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Only image files are allowed',
                    error: 'Invalid file type'
                });
            }
            
            // Check for empty files
            const emptyFiles = req.files.filter(file => 
                !file.buffer || file.buffer.length === 0 || file.size === 0
            );
            
            if (emptyFiles.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more files are empty',
                    error: 'Empty file detected'
                });
            }
            
            // Log information about received files
            console.log(`Received ${req.files.length} files:`, req.files.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname,
                mimetype: f.mimetype,
                size: f.size
            })));
        } else {
            console.log('No files received in the request');
        }
        
        // Log body keys for debugging
        console.log(`Request body keys:`, Object.keys(req.body));
        
        next();
    });
};

// Public routes
router.get('/', getAllEvents);
router.get('/:eventId', getEventDetails);

// Protected routes - only after this middleware
router.use(protectRoute);

// Create event route
router.post('/', handleUpload, createEvent);

// Update event route
router.put('/:eventId', handleUpload, updateEvent);

// Update event status
router.patch('/:eventId/status', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    
    if (!status || !['published', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be published or cancelled.'
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check permission - only creator or admin can update status
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this event status'
      });
    }
    
    // Update the status directly using findByIdAndUpdate to bypass validation
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { status },
      { 
        new: true,
        runValidators: false // Skip validation to prevent category validation errors
      }
    ).populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      message: 'Event status updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event status',
      error: error.message
    });
  }
});

router.delete('/:eventId', deleteEvent);
router.post('/:eventId/register', registerForEvent);
router.post('/:eventId/comments', addEventComment);
router.get('/:eventId/participants', getEventParticipants);

export default router;