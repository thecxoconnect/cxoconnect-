import crypto from 'crypto';
import User from '../models/User.js';
import { sendActivationEmail } from '../config/mailer.js';

/**
 * 1. Admin Summary Counts
 * Guard: isAuth, isAdmin
 */
export const getAdminOverview = async (req, res) => {
  try {
    const totalCount = await User.countDocuments({});
    const pendingCount = await User.countDocuments({ status: 'pending' });
    const approvedCount = await User.countDocuments({ status: { $in: ['approved', 'accepted'] } });
    const declinedCount = await User.countDocuments({ status: { $in: ['declined', 'rejected'] } });
    const inactiveCount = await User.countDocuments({ status: 'inactive' });

    return res.status(200).json({
      success: true,
      summary: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        declined: declinedCount,
        inactive: inactiveCount
      }
    });
  } catch (error) {
    console.error('[getAdminOverview Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative overview metrics.',
      error: error.message
    });
  }
};

/**
 * 2. Get All Users / Applications
 * Guard: isAuth, isAdmin
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, tab, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role) filter.role = role;

    if (status) {
      filter.status = status;
    } else if (tab === 'applications') {
      filter.status = { $in: ['pending', 'declined', 'rejected'] };
    } else if (tab === 'members') {
      filter.status = { $in: ['approved', 'accepted', 'inactive'] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      users: users.map((u) => u.toSafeJSON())
    });
  } catch (error) {
    console.error('[getAllUsers Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve records.',
      error: error.message
    });
  }
};

/**
 * 3. Approve Application & Trigger Account Setup Invitation
 * Guard: isAuth, isAdmin
 */
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Applicant not found.' });
    }

    // Generate activation token (valid for 7 days)
    const activationToken = crypto.randomBytes(32).toString('hex');
    user.activationToken = activationToken;
    user.activationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.status = 'approved';
    user.approvedAt = new Date();
    await user.save();

    // Send account setup email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    const activationUrl = `${clientUrl}/#activate?token=${activationToken}`;
    await sendActivationEmail(user.email, user.name || 'Executive Member', activationUrl);

    return res.status(200).json({
      success: true,
      message: `Application for ${user.name || user.email} approved. Account setup invitation sent.`,
      activationUrl,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[approveApplication Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve application.',
      error: error.message
    });
  }
};

/**
 * 4. Decline Application
 * Guard: isAuth, isAdmin
 */
export const declineApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Applicant not found.' });
    }

    user.status = 'declined';
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Application for ${user.name || user.email} declined.`,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[declineApplication Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to decline application.',
      error: error.message
    });
  }
};

/**
 * 5. Deactivate Member Access
 * Guard: isAuth, isAdmin
 */
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    if (user.isMainAdmin && !req.user.isMainAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only a main administrator can deactivate another main admin.'
      });
    }

    user.status = 'inactive';
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Access for ${user.name || user.email} deactivated.`,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[deactivateUser Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate access.',
      error: error.message
    });
  }
};

/**
 * 6. Resend Account Setup Invitation
 * Guard: isAuth, isAdmin
 */
export const resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const activationToken = crypto.randomBytes(32).toString('hex');
    user.activationToken = activationToken;
    user.activationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    const activationUrl = `${clientUrl}/#activate?token=${activationToken}`;
    await sendActivationEmail(user.email, user.name || 'Executive Member', activationUrl);

    return res.status(200).json({
      success: true,
      message: `Fresh account setup invitation dispatched to ${user.email}.`,
      activationUrl
    });
  } catch (error) {
    console.error('[resendInvitation Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend invitation.',
      error: error.message
    });
  }
};

/**
 * 7. Directly Add Member by Admin
 * Guard: isAuth, isAdmin
 */
export const addMember = async (req, res) => {
  try {
    const { name, email, designation, company, phone, linkedin, role = 'member' } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({
        success: false,
        message: 'Name, work email, and company are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A member or application with this email already exists.'
      });
    }

    const activationToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      designation: (designation || '').trim(),
      position: (designation || '').trim(),
      company: company.trim(),
      phone: (phone || '').trim(),
      linkedin: (linkedin || '').trim(),
      role: role === 'admin' ? 'admin' : 'member',
      status: 'approved',
      activationToken,
      activationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      approvedAt: new Date()
    });

    await newUser.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    const activationUrl = `${clientUrl}/#activate?token=${activationToken}`;
    await sendActivationEmail(newUser.email, newUser.name, activationUrl);

    return res.status(201).json({
      success: true,
      message: `Member ${newUser.name} created and activation invitation sent.`,
      activationUrl,
      user: newUser.toSafeJSON()
    });
  } catch (error) {
    console.error('[addMember Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add member.',
      error: error.message
    });
  }
};

/**
 * 8. Edit Member Details
 * Guard: isAuth, isAdmin
 */
export const editMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, designation, position, phone, linkedin, status, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    if (user.isMainAdmin && !req.user.isMainAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only a main admin can modify another main admin.'
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (company !== undefined) user.company = company.trim();
    if (designation !== undefined || position !== undefined) {
      user.designation = (designation || position).trim();
      user.position = (position || designation).trim();
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (linkedin !== undefined) user.linkedin = linkedin.trim();
    if (status !== undefined && ['pending', 'approved', 'accepted', 'declined', 'rejected', 'inactive'].includes(status)) {
      user.status = status;
    }
    if (role !== undefined && req.user.isMainAdmin) {
      user.role = role;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Member details updated successfully.',
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[editMember Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update member.',
      error: error.message
    });
  }
};

/**
 * 9. Legacy updateUserStatus & updateUserRole (Retained for backwards compatibility)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found.' });

    if (targetUser.isMainAdmin && !req.user.isMainAdmin) {
      return res.status(403).json({ success: false, message: 'Only a main admin can modify another main admin.' });
    }

    targetUser.status = status;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}.`,
      user: targetUser.toSafeJSON()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isMainAdmin: newMainAdmin } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found.' });

    if (role && ['member', 'admin'].includes(role)) targetUser.role = role;
    if (typeof newMainAdmin === 'boolean') {
      targetUser.isMainAdmin = newMainAdmin;
      if (newMainAdmin) {
        targetUser.role = 'admin';
        targetUser.status = 'approved';
      }
    }

    await targetUser.save();
    return res.status(200).json({ success: true, message: 'User role updated.', user: targetUser.toSafeJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
