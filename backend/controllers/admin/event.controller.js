import Event from "../../models/event.model.js";
import User from "../../models/user.model.js";
import cloudinary from "../../lib/cloudinary.js";

export const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;

    const events = await Event.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    const totalEvents = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      events,
      totalEvents,
      page: Number(page),
      totalPages: Math.ceil(totalEvents / limit)
    });
  } catch (error) {
    console.error('Admin get all events error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = req.body;

    // Admin can update any event without ownership check
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Admin update event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Admin can delete any event
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      participants: event.participants
    });
  } catch (error) {
    console.error('Admin get participants error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};