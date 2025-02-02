import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Event from "../models/event.model.js";
import mongoose from "mongoose";
export const registerForEvent = async (req, res) => {
	const { eventId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ error: "Invalid Event ID" });
  }
	try {
	  // Check if the event exists
    
	  const event = await Event.findById(eventId);
	  if (!event) {
      

		return res.status(404).json({ message: "Event not found" });
	  }
  
	  // Check if the user is already registered
	  const alreadyRegistered = event.participants.includes(req.user._id);
	  if (alreadyRegistered) {
		return res.status(400).json({ message: "You are already registered for this event" });
	  }
  
	  // Add user to the participants list
	  event.participants.push(req.user._id);
	  await event.save();
  
	  res.status(200).json({
		message: "Successfully registered for the event",
		event,
	  });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: "Server error" });
	}
  };
  
  export const getEventDetails = async (req, res) => {
    const { eventId } = req.params;
  
    try {
      const event = await Event.findById(eventId); 
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(event); 
    } catch (error) {
      console.error('Error fetching event details:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  export const getEvents = async (req, res) => {
    try {
      const events = await Event.find();
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Error fetching events' });
    }
  };
  