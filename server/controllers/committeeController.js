import mongoose from 'mongoose';
import Committee from '../models/Committee.js';

const FALLBACK_COMMITTEE = [
  {
    _id: 'comm_1',
    name: 'Deepak Parekh',
    designation: 'Honorary Chairman',
    company: 'CXO Connect Advisory Council',
    category: 'Advisory Board',
    bio: 'Distinguished veteran shaping corporate governance and financial strategy frameworks for over 4 decades.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    linkedin: 'https://linkedin.com',
    order: 1
  },
  {
    _id: 'comm_2',
    name: 'Kiran Mazumdar-Shaw',
    designation: 'Executive Council Member',
    company: 'Biocon',
    category: 'Executive Committee',
    bio: 'Global healthcare and biotech pioneer advancing sustainable enterprise growth and innovation agendas.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    linkedin: 'https://linkedin.com',
    order: 2
  },
  {
    _id: 'comm_3',
    name: 'Suresh Narayanan',
    designation: 'Governance & Ethics Chair',
    company: 'Nestlé India',
    category: 'Advisory Board',
    bio: 'Renowned corporate leader guiding strategic stakeholder trust, crisis management, and executive succession.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    linkedin: 'https://linkedin.com',
    order: 3
  }
];

export const getCommittee = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: FALLBACK_COMMITTEE.length,
        data: FALLBACK_COMMITTEE
      });
    }

    const { category } = req.query;
    const query = category ? { category } : {};

    const members = await Committee.find(query).sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: members.length > 0 ? members.length : FALLBACK_COMMITTEE.length,
      data: members.length > 0 ? members : FALLBACK_COMMITTEE
    });
  } catch (error) {
    console.warn('[getCommittee Fallback]', error.message);
    return res.status(200).json({
      success: true,
      count: FALLBACK_COMMITTEE.length,
      data: FALLBACK_COMMITTEE
    });
  }
};

export const createCommitteeMember = async (req, res) => {
  try {
    const { name, designation, company, category, bio, image, linkedin, order } = req.body;

    if (!name || !designation || !company) {
      return res.status(400).json({
        success: false,
        message: 'Name, designation, and company are required.'
      });
    }

    const member = new Committee({
      name,
      designation,
      company,
      category: category || 'Executive Committee',
      bio: bio || '',
      image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
      linkedin: linkedin || '',
      order: Number(order) || 0
    });

    await member.save();

    return res.status(201).json({
      success: true,
      message: 'Committee leader added successfully.',
      data: member
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add committee member.',
      error: error.message
    });
  }
};

export const updateCommitteeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Committee.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Committee member not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Committee member updated.',
      data: member
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update committee member.',
      error: error.message
    });
  }
};

export const deleteCommitteeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Committee.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Committee member not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Committee member removed.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete committee member.',
      error: error.message
    });
  }
};
