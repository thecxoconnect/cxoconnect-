import Mentor from '../models/Mentor.js';

export const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve C-suite mentors.',
      error: error.message
    });
  }
};

export const requestMentorship = async (req, res) => {
  try {
    const { mentorId, topic, notes } = req.body;
    const user = req.user;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.'
      });
    }

    // In production, an email can be triggered to the mentor and user
    return res.status(200).json({
      success: true,
      message: `Your advisory session request with ${mentor.name} (${mentor.designation}) has been registered. The executive secretariat will coordinate your calendar schedule.`,
      requestDetails: {
        mentor: mentor.name,
        requestedBy: user.name || user.email,
        topic: topic || 'Strategic Leadership & Growth',
        timestamp: new Date()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit mentorship request.',
      error: error.message
    });
  }
};

export const createMentor = async (req, res) => {
  try {
    const { name, designation, company, expertise, bio, image, linkedin, availableForMentorship } = req.body;

    if (!name || !designation || !company) {
      return res.status(400).json({
        success: false,
        message: 'Name, designation, and company are required.'
      });
    }

    const mentor = new Mentor({
      name,
      designation,
      company,
      expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map(e => e.trim()) : []),
      bio: bio || '',
      image: image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
      linkedin: linkedin || '',
      availableForMentorship: availableForMentorship !== undefined ? availableForMentorship : true
    });

    await mentor.save();

    return res.status(201).json({
      success: true,
      message: 'C-suite mentor onboarded.',
      data: mentor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create mentor profile.',
      error: error.message
    });
  }
};

export const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mentor profile updated.',
      data: mentor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update mentor.',
      error: error.message
    });
  }
};

export const deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findByIdAndDelete(id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mentor profile removed.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete mentor.',
      error: error.message
    });
  }
};
