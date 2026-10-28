import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('attendees', 'name position company profileImage')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('[getEvents Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve executive events.',
      error: error.message
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate('attendees', 'name email position company profileImage');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event details.',
      error: error.message
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, location, category, banner, speakers } = req.body;

    if (!title || !description || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, date, and venue for the event.'
      });
    }

    const event = new Event({
      title,
      description,
      date,
      time: time || '09:30 AM - 04:30 PM IST',
      venue,
      location: location || 'Mumbai, India',
      category: category || 'Leadership Summit',
      banner: banner || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
      speakers: speakers || []
    });

    await event.save();

    return res.status(201).json({
      success: true,
      message: 'Executive event scheduled successfully.',
      data: event
    });
  } catch (error) {
    console.error('[createEvent Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event.',
      error: error.message
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update event.',
      error: error.message
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event.',
      error: error.message
    });
  }
};

export const rsvpEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    const alreadyRegistered = event.attendees.some(
      (attendeeId) => attendeeId.toString() === userId.toString()
    );

    if (alreadyRegistered) {
      // Toggle off / cancel RSVP
      event.attendees = event.attendees.filter(
        (attendeeId) => attendeeId.toString() !== userId.toString()
      );
      await event.save();
      return res.status(200).json({
        success: true,
        message: 'Your seat reservation has been cancelled.',
        isRegistered: false,
        attendeeCount: event.attendees.length
      });
    } else {
      // Register
      event.attendees.push(userId);
      await event.save();
      return res.status(200).json({
        success: true,
        message: 'Seat confirmed! You are registered for this CXO Conclave.',
        isRegistered: true,
        attendeeCount: event.attendees.length
      });
    }
  } catch (error) {
    console.error('[rsvpEvent Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register for event.',
      error: error.message
    });
  }
};
