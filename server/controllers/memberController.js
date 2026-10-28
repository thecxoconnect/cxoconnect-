import User from '../models/User.js';
import Event from '../models/Event.js';
import Mentor from '../models/Mentor.js';
import Chapter from '../models/Chapter.js';

/**
 * getMembers
 * Admin access: list members with optional status, role, search filters
 */
export const getMembers = async (req, res) => {
  try {
    const { status, role, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      query.status = status;
    }

    if (role && ['member', 'admin'].includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const members = await User.find(query)
      .select('-otp -otpExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count: members.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: members
    });
  } catch (error) {
    console.error('[getMembers Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve executive members directory.',
      error: error.message
    });
  }
};

/**
 * getMemberStats
 * Admin metrics: counts by status, role, verification
 */
export const getMemberStats = async (req, res) => {
  try {
    const [total, pending, accepted, rejected, admins, verified] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: 'accepted' }),
      User.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isEmailVerified: true })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalExecutives: total,
        pendingApplications: pending,
        acceptedMembers: accepted,
        rejectedApplications: rejected,
        administrators: admins,
        verifiedAccounts: verified
      }
    });
  } catch (error) {
    console.error('[getMemberStats Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch executive platform statistics.',
      error: error.message
    });
  }
};

/**
 * getMemberById
 */
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await User.findById(id).select('-otp -otpExpires');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Executive member not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve executive details.',
      error: error.message
    });
  }
};

/**
 * updateMemberStatus
 * Approves ('accepted'), rejects ('rejected'), or sets 'pending'
 */
export const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, accepted, or rejected.'
      });
    }

    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Executive member not found.'
      });
    }

    member.status = status;
    await member.save();

    return res.status(200).json({
      success: true,
      message: `Executive status updated to ${status} successfully.`,
      data: member.toSafeJSON()
    });
  } catch (error) {
    console.error('[updateMemberStatus Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update member status.',
      error: error.message
    });
  }
};

/**
 * updateMemberRole
 * Super Admin (isMainAdmin) can promote/demote users to admin role
 */
export const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isMainAdmin: makeMainAdmin } = req.body;

    if (!role || !['member', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be member or admin.'
      });
    }

    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Executive member not found.'
      });
    }

    member.role = role;
    if (typeof makeMainAdmin === 'boolean') {
      member.isMainAdmin = makeMainAdmin;
    }
    // If promoted to admin, ensure status is accepted
    if (role === 'admin' && member.status !== 'accepted') {
      member.status = 'accepted';
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: `Role for ${member.name || member.email} successfully updated to ${role}.`,
      data: member.toSafeJSON()
    });
  } catch (error) {
    console.error('[updateMemberRole Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update role.',
      error: error.message
    });
  }
};

/**
 * deleteMember
 * Admin endpoint
 */
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.'
      });
    }

    if (member.isMainAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete primary root administrator account.'
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Executive account removed successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete member.',
      error: error.message
    });
  }
};

/**
 * getPublicStats
 * Public endpoint for Home page stats band
 */
export const getPublicStats = async (req, res) => {
  try {
    const [totalMembers, totalEvents, totalMentors, totalChapters] = await Promise.all([
      User.countDocuments({ status: 'accepted' }),
      Event.countDocuments(),
      Mentor.countDocuments(),
      Chapter.countDocuments()
    ]);

    const companies = await User.distinct('company', { status: 'accepted' });

    return res.status(200).json({
      success: true,
      data: {
        totalMembers: totalMembers > 0 ? totalMembers : 2500,
        annualConclaves: totalEvents > 0 ? totalEvents : 45,
        boardroomInfluence: '98%',
        globalChapters: totalChapters > 0 ? totalChapters : 8,
        companiesCount: companies.length > 0 ? companies.length : 120
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
