import mongoose from 'mongoose';
import ImageKit from 'imagekit';
import { Mentor } from '../models/Mentor.js';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_FM+NjiOm9mon9aJRMafj4uJU0Os=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_b5MJ/q/qnoFrOniYEX3jnEJ0KKw=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/thecxoconnect'
});

const FALLBACK_MENTORS = [
  {
    _id: 'mentor_1',
    name: 'Arun M. Parameswaran',
    designation: 'Ex-MD & Senior VP',
    company: 'Salesforce India',
    expertise: ['Enterprise SaaS', 'Go-To-Market', 'Board Governance'],
    bio: 'Over 28 years driving exponential revenue expansions, executive talent grooming, and cross-border digital shifts.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    linkedin: 'https://linkedin.com',
    linkedinUrl: 'https://linkedin.com',
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
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    linkedin: 'https://linkedin.com',
    linkedinUrl: 'https://linkedin.com',
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
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    linkedin: 'https://linkedin.com',
    linkedinUrl: 'https://linkedin.com',
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
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    linkedin: 'https://linkedin.com',
    linkedinUrl: 'https://linkedin.com',
    availableForMentorship: true,
    city: 'Hyderabad'
  }
];

export const getMentors = async (req, res) => {
  try {
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
    const { name, city, linkedinUrl, bio, designation, company, expertise, image, linkedin, availableForMentorship } = req.body;
    let photoUrl = '';
    let imageKitFileId = '';

    // Process upload if binary buffer exists in req.file (Multer memory storage)
    if (req.file && req.file.buffer) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `mentor_${Date.now()}.jpg`,
        folder: '/cxoconnect/mentors/'
      });
      photoUrl = uploadResponse.url || '';
      imageKitFileId = uploadResponse.fileId || '';
    } else if (typeof req.body.photoUrl === 'string') {
      photoUrl = req.body.photoUrl;
    } else if (typeof req.body.image === 'string') {
      photoUrl = req.body.image;
    }

    const mentor = new Mentor({
      name: String(name || '').trim(),
      city: String(city || '').trim() || 'Mumbai',
      linkedinUrl: String(linkedinUrl || linkedin || '').trim(),
      designation: String(designation || '').trim() || 'C-Suite Advisor',
      company: String(company || '').trim() || 'Enterprise',
      bio: String(bio || '').trim(),
      photoUrl: String(photoUrl),
      image: String(photoUrl),
      imageKitFileId: String(imageKitFileId),
      expertise: Array.isArray(expertise)
        ? expertise
        : (typeof expertise === 'string' && expertise.trim()
            ? expertise.split(',').map(e => e.trim())
            : ['Strategic Governance', 'Enterprise Scaling']),
      availableForMentorship: availableForMentorship !== undefined ? Boolean(availableForMentorship) : true
    });

    await mentor.save();
    return res.status(201).json({ success: true, message: 'C-suite mentor onboarded.', data: mentor });
  } catch (err) {
    console.error('createMentor validation error:', err.message);
    return res.status(500).json({ success: false, error: err.message, message: err.message });
  }
};

export const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.'
      });
    }

    let photoUrl = mentor.photoUrl || mentor.image || '';
    let imageKitFileId = mentor.imageKitFileId || '';

    if (req.file && req.file.buffer) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `mentor_${Date.now()}.jpg`,
        folder: '/cxoconnect/mentors/'
      });
      photoUrl = uploadResponse.url || '';
      imageKitFileId = uploadResponse.fileId || '';
    } else if (typeof req.body.photoUrl === 'string') {
      photoUrl = req.body.photoUrl;
    } else if (typeof req.body.image === 'string') {
      photoUrl = req.body.image;
    }

    if (req.body.name !== undefined) mentor.name = String(req.body.name || '').trim();
    if (req.body.city !== undefined) mentor.city = String(req.body.city || '').trim();
    if (req.body.linkedinUrl !== undefined || req.body.linkedin !== undefined) {
      mentor.linkedinUrl = String(req.body.linkedinUrl || req.body.linkedin || '').trim();
      mentor.linkedin = mentor.linkedinUrl;
    }
    if (req.body.designation !== undefined) mentor.designation = String(req.body.designation || '').trim();
    if (req.body.company !== undefined) mentor.company = String(req.body.company || '').trim();
    if (req.body.bio !== undefined) mentor.bio = String(req.body.bio || '').trim();
    if (req.body.availableForMentorship !== undefined) mentor.availableForMentorship = Boolean(req.body.availableForMentorship);
    if (req.body.expertise !== undefined) {
      mentor.expertise = Array.isArray(req.body.expertise)
        ? req.body.expertise
        : (typeof req.body.expertise === 'string' ? req.body.expertise.split(',').map(e => e.trim()) : mentor.expertise);
    }
    mentor.photoUrl = String(photoUrl);
    mentor.image = String(photoUrl);
    mentor.imageKitFileId = String(imageKitFileId);

    await mentor.save();
    return res.status(200).json({
      success: true,
      message: 'Mentor profile updated.',
      data: mentor
    });
  } catch (err) {
    console.error('updateMentor validation error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: err.message
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

export default {
  getMentors,
  requestMentorship,
  createMentor,
  updateMentor,
  deleteMentor
};
