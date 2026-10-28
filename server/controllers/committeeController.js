import Committee from '../models/Committee.js';

export const getCommittee = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const members = await Committee.find(query).sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve committee members.',
      error: error.message
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
