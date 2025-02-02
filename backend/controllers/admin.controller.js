import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAdminStats = async (req, res) => {
	try {
		const userCount = await User.countDocuments();
		const postCount = 100; // Replace with actual logic
		const eventCount = 50; // Replace with actual logic
		const jobCount = 30;  // Replace with actual logic

		res.status(200).json({
			users: userCount,
			posts: postCount,
			events: eventCount,
			jobs: jobCount,
		});
	} catch (error) {
		console.error("Error fetching admin stats:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getAllUsers = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const users = await User.find()
			.skip((page - 1) * limit)
			.limit(Number(limit));
		const totalUsers = await User.countDocuments();

		res.status(200).json({ users, totalUsers });
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ message: "Server error" });
	}
};
export const createEvent = async (req, res) => {
	try {
		const { title, description, date, time, location } = req.body;

		const event = await Event.create({
			title,
			description,
			date,
			time,
			location,
			createdBy: req.user._id,
		});

		res.status(201).json({ message: "Event created successfully", event });
	} catch (error) {
		console.error("Error creating event:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get all events with pagination and filters
export const getAllEvents = async (req, res) => {
	try {
		const { page = 1, limit = 10, search = "" } = req.query;
		const query = search ? { title: { $regex: search, $options: "i" } } : {};

		const events = await Event.find(query)
			.skip((page - 1) * limit)
			.limit(Number(limit))
			.sort({ date: -1 });

		const totalEvents = await Event.countDocuments(query);

		res.status(200).json({ events, totalEvents });
	} catch (error) {
		console.error("Error fetching events:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Update an event
export const updateEvent = async (req, res) => {
	try {
		const { eventId } = req.params;
		const { title, description, date, time, location } = req.body;

		const updatedEvent = await Event.findByIdAndUpdate(
			eventId,
			{ title, description, date, time, location },
			{ new: true }
		);

		if (!updatedEvent) {
			return res.status(404).json({ message: "Event not found" });
		}

		res.status(200).json({ message: "Event updated successfully", updatedEvent });
	} catch (error) {
		console.error("Error updating event:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Delete an event
export const deleteEvent = async (req, res) => {
	try {
		const { eventId } = req.params;

		const deletedEvent = await Event.findByIdAndDelete(eventId);

		if (!deletedEvent) {
			return res.status(404).json({ message: "Event not found" });
		}

		res.status(200).json({ message: "Event deleted successfully" });
	} catch (error) {
		console.error("Error deleting event:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get RSVP details (optional)
export const getEventRSVPs = async (req, res) => {
	try {
		const { eventId } = req.params;

		const event = await Event.findById(eventId).populate("participants", "name email");

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		res.status(200).json({ participants: event.participants });
	} catch (error) {
		console.error("Error fetching RSVPs:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const uploadEventImages = async (req, res) => {
    const { eventId } = req.params;
    const { images } = req.body; // Expecting an array of base64-encoded images
  
    try {
      // Find the event
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Upload images to Cloudinary
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image, {
            folder: `events/${eventId}`, // Save in a folder for better organization
          });
          return result.secure_url;
        })
      );
  
      // Save the image URLs to the event
      event.images.push(...uploadedImages);
      await event.save();
  
      res.status(200).json({
        message: "Images uploaded successfully",
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Error uploading event images:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
// Add job management logic as needed
