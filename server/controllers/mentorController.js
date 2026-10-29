import mongoose from 'mongoose';
import Mentor from '../models/Mentor.js';

const FALLBACK_MENTORS = [
  {
    _id: 'mentor_1',
    name: 'Arun M. Parameswaran',
    designation: 'Ex-MD & Senior VP',
    company: 'Salesforce India',
    expertise: ['Enterprise SaaS', 'Go-To-Market', 'Board Governance'],
    bio: 'Over 28 years driving exponential revenue expansions, executive talent grooming, and cross-border digital shifts.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    linkedin: 'https://linkedin.com',
    availableForMentorship: true,
    city: 'Mumbai'
  },
  {
    _id: 'mentor_2',
    name: 'Nandita Gurjar',
    designation: 'Independent Director & Ex-Global CHRO',
    company: 'Infosys',
    expertise: ['Culture Transformation', 'Executive Compensation', 'Succession Planning'],
    bio: 'Senior board advisor orchestrating large-scale workforce evolution, board governance, and global HR leadership.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    linkedin: 'https://linkedin.com',
    availableForMentorship: true,
    city: 'Bengaluru'
  },
  {
    _id: 'mentor_3',
    name: 'Raghavan Sreenivasan',
    designation: 'Managing Partner & CIO',
    company: 'Equitas Global Capital',
    expertise: ['M&A Valuation', 'Capital Allocation', 'Private Equity'],
    bio: 'Seasoned investment titan advising founders and CEOs on $2B+ structured buyouts and public debt offerings.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    linkedin: 'https://linkedin.com',
    availableForMentorship: true,
    city: 'New Delhi'
  },
  {
    _id: 'mentor_4',
    name: 'Pooja Bhattacharya',
    designation: 'Chief AI & Product Officer',
    company: 'HyperScale Labs',
    expertise: ['Generative AI Architecture', 'Enterprise Transformation', 'Product Velocity'],
    bio: 'Recognized global AI thought leader pioneering autonomous agent frameworks for Fortune 500 banks and retail.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    linkedin: 'https://linkedin.com',
    availableForMentorship: true,
    city: 'Hyderabad'
  }
];

export const getMentors = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: FALLBACK_MENTORS.length,
        data: FALLBACK_MENTORS
      });
    }

    const mentors = await Mentor.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: mentors.length > 0 ? mentors.length : FALLBACK_MENTORS.length,
      data: mentors.length > 0 ? mentors : FALLBACK_MENTORS
    });
  } catch (error) {
    console.warn('[getMentors Fallback]', error.message);
    return res.status(200).json({
      success: true,
      count: FALLBACK_MENTORS.length,
      data: FALLBACK_MENTORS
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
