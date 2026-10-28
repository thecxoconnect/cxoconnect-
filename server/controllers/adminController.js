import mongoose from 'mongoose';
import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import Committee from '../models/Committee.js';
import Sponsor from '../models/Sponsor.js';
import Event from '../models/Event.js';
import Question from '../models/Question.js';
import Testimonial from '../models/Testimonial.js';
import { uploadFileToImageKit, deleteFileFromImageKit } from '../config/imagekit.js';
import { getMailerTransporter } from '../config/email.js';

// ==========================================
// MODULE 1: OVERVIEW & ANALYTICS
// ==========================================

export const getAdminOverview = async (req, res) => {
  try {
    const [approvedMembers, secondaryAdmins, stats] = await Promise.all([
      User.find({ status: 'accepted' }).sort({ createdAt: -1 }),
      User.find({ role: 'admin', isMainAdmin: { $ne: true } }).sort({ createdAt: -1 }),
      User.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const counts = {
      approved: approvedMembers.length,
      secondaryAdmins: secondaryAdmins.length,
      pending: stats.find((s) => s._id === 'pending')?.count || 0,
      rejected: stats.find((s) => s._id === 'rejected')?.count || 0
    };

    return res.status(200).json({
      success: true,
      data: {
        counts,
        approvedMembers,
        secondaryAdmins
      }
    });
  } catch (error) {
    console.error('[getAdminOverview Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    // 1. Dynamic aggregation for real-time counts across approved members
    const aggregateMetrics = await User.aggregate([
      {
        $facet: {
          approvedCounts: [
            { $match: { status: 'accepted' } },
            {
              $group: {
                _id: null,
                totalApprovedMembers: { $sum: 1 },
                uniqueCities: { $addToSet: { $toLower: '$city' } },
                uniqueCompanies: { $addToSet: { $toLower: '$company' } },
                uniquePincodes: { $addToSet: '$pincode' }
              }
            },
            {
              $project: {
                totalApprovedMembers: 1,
                totalCities: { $size: '$uniqueCities' },
                totalCompanies: { $size: '$uniqueCompanies' },
                totalPincodes: { $size: '$uniquePincodes' }
              }
            }
          ],
          totalCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          secondaryAdmins: [
            { $match: { role: 'admin', isMainAdmin: { $ne: true } } },
            { $count: 'count' }
          ],
          cityDistribution: [
            { $match: { status: 'accepted', city: { $exists: true, $ne: '' } } },
            {
              $group: {
                _id: '$city',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 6 }
          ],
          companyDistribution: [
            { $match: { status: 'accepted', company: { $exists: true, $ne: '' } } },
            {
              $group: {
                _id: '$company',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 6 }
          ]
        }
      }
    ]);

    const result = aggregateMetrics[0] || {};
    const approvedStats = result.approvedCounts?.[0] || {
      totalApprovedMembers: 0,
      totalCities: 0,
      totalCompanies: 0,
      totalPincodes: 0
    };

    let waitlistCount = 0;
    let rejectedCount = 0;
    let totalAllCount = 0;

    (result.totalCounts || []).forEach((item) => {
      totalAllCount += item.count;
      if (item._id === 'pending') waitlistCount = item.count;
      if (item._id === 'rejected') rejectedCount = item.count;
    });

    const secondaryAdminsCount = result.secondaryAdmins?.[0]?.count || 0;

    // Platform content counts
    const [mentorCount, committeeCount, eventCount, sponsorCount, quizCount, testimonialCount] = await Promise.all([
      Mentor.countDocuments(),
      Committee.countDocuments(),
      Event.countDocuments(),
      Sponsor.countDocuments(),
      Question.countDocuments(),
      Testimonial.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalMembers: approvedStats.totalApprovedMembers,
        totalCompanies: approvedStats.totalCompanies,
        totalCities: approvedStats.totalCities,
        totalPincodes: approvedStats.totalPincodes,
        waitlistCount,
        rejectedCount,
        totalAllCount,
        secondaryAdminsCount,
        cityDistribution: (result.cityDistribution || []).map((c) => ({ city: c._id, count: c.count })),
        companyDistribution: (result.companyDistribution || []).map((c) => ({ company: c._id, count: c.count })),
        counts: {
          mentors: mentorCount,
          committee: committeeCount,
          events: eventCount,
          sponsors: sponsorCount,
          quiz: quizCount,
          testimonials: testimonialCount
        }
      }
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Export CSV of members
export const exportMembersReport = async (req, res) => {
  try {
    const { status = 'accepted' } = req.query;
    const filter = status === 'all' ? {} : { status };
    const members = await User.find(filter).sort({ createdAt: -1 });

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'City', 'Pincode', 'Role', 'Status', 'JoinedDate'];
    const rows = members.map((m) => [
      `"${m.name || ''}"`,
      `"${m.email || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.company || ''}"`,
      `"${m.position || ''}"`,
      `"${m.city || ''}"`,
      `"${m.pincode || ''}"`,
      `"${m.role || ''}"`,
      `"${m.status || ''}"`,
      `"${m.createdAt ? m.createdAt.toISOString() : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="cxo_connect_members_${status}_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('[Export Report Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MODULE 2: MEMBER & SECONDARY ADMIN WORKFLOWS
// ==========================================

export const getAdminMembers = async (req, res) => {
  try {
    const { status, role, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      // Map 'waitlist' to 'pending'
      query.status = status === 'waitlist' ? 'pending' : status;
    }

    if (role && role !== 'all') {
      if (role === 'secondary_admin') {
        query.role = 'admin';
        query.isMainAdmin = { $ne: true };
      } else {
        query.role = role;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await User.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });

    return res.status(200).json({
      success: true,
      message: `Member status updated to ${status}.`,
      data: user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'Member not found.' });

    if (targetUser.isMainAdmin) {
      return res.status(403).json({ success: false, message: 'Super Admin permissions cannot be modified.' });
    }

    targetUser.role = role === 'admin' ? 'admin' : 'member';
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `Role changed to ${targetUser.role}.`,
      data: targetUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (targetUser.isMainAdmin) {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin account.' });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Account removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MODULE 3: MENTORS & COMMITTEE MANAGEMENT
// ==========================================

export const getAdminMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: mentors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminMentor = async (req, res) => {
  try {
    let photoUrl = req.body.photoUrl || req.body.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80';
    let imageKitFileId = '';

    const imageFile = req.file || (req.files && (req.files.find(f => f.fieldname === 'image' || f.fieldname === 'photo' || f.fieldname === 'photoUrl') || req.files[0]));
    if (imageFile) {
      const uploadResult = await uploadFileToImageKit(imageFile.buffer, `mentor_${req.body.name || 'avatar'}`, '/cxoconnect/mentors/');
      photoUrl = uploadResult.url;
      imageKitFileId = uploadResult.fileId;
    }

    const mentor = new Mentor({
      name: req.body.name,
      designation: req.body.designation || 'C-Suite Advisor',
      company: req.body.company || 'Enterprise',
      city: req.body.city || 'Mumbai',
      linkedinUrl: req.body.linkedinUrl || req.body.linkedin || '',
      photoUrl,
      imageKitFileId,
      image: photoUrl,
      linkedin: req.body.linkedinUrl || req.body.linkedin || '',
      expertise: typeof req.body.expertise === 'string' ? req.body.expertise.split(',').map((s) => s.trim()) : req.body.expertise || ['Strategic Leadership', 'Executive Advisory'],
      bio: req.body.bio || ''
    });

    await mentor.save();
    return res.status(201).json({ success: true, message: 'Mentor created successfully.', data: mentor });
  } catch (error) {
    console.error('[Create Mentor Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found.' });

    const imageFile = req.file || (req.files && (req.files.find(f => f.fieldname === 'image' || f.fieldname === 'photo' || f.fieldname === 'photoUrl') || req.files[0]));
    if (imageFile) {
      if (mentor.imageKitFileId) await deleteFileFromImageKit(mentor.imageKitFileId);
      const uploadResult = await uploadFileToImageKit(imageFile.buffer, `mentor_${req.body.name || mentor.name}`, '/cxoconnect/mentors/');
      mentor.photoUrl = uploadResult.url;
      mentor.imageKitFileId = uploadResult.fileId;
      mentor.image = uploadResult.url;
    }

    if (req.body.name) mentor.name = req.body.name;
    if (req.body.designation) mentor.designation = req.body.designation;
    if (req.body.company) mentor.company = req.body.company;
    if (req.body.city) mentor.city = req.body.city;
    if (req.body.linkedinUrl || req.body.linkedin) {
      mentor.linkedinUrl = req.body.linkedinUrl || req.body.linkedin;
      mentor.linkedin = mentor.linkedinUrl;
    }
    if (req.body.bio !== undefined) mentor.bio = req.body.bio;
    if (req.body.expertise) {
      mentor.expertise = typeof req.body.expertise === 'string' ? req.body.expertise.split(',').map((s) => s.trim()) : req.body.expertise;
    }

    await mentor.save();
    return res.status(200).json({ success: true, message: 'Mentor updated successfully.', data: mentor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findById(id);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found.' });

    if (mentor.imageKitFileId) await deleteFileFromImageKit(mentor.imageKitFileId);
    await Mentor.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Mentor deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Committee management
export const getAdminCommittee = async (req, res) => {
  try {
    const committee = await Committee.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: committee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminCommittee = async (req, res) => {
  try {
    let photoUrl = req.body.photoUrl || req.body.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80';
    let imageKitFileId = '';

    if (req.file) {
      const uploadResult = await uploadFileToImageKit(req.file.buffer, `committee_${req.body.name || 'avatar'}`, '/cxoconnect/committee/');
      photoUrl = uploadResult.url;
      imageKitFileId = uploadResult.fileId;
    }

    const member = new Committee({
      name: req.body.name,
      designation: req.body.designation || 'Board Member',
      company: req.body.company || 'Enterprise',
      city: req.body.city || 'Mumbai',
      category: req.body.category || 'Executive Committee',
      linkedinUrl: req.body.linkedinUrl || req.body.linkedin || '',
      photoUrl,
      imageKitFileId,
      image: photoUrl,
      bio: req.body.bio || ''
    });

    await member.save();
    return res.status(201).json({ success: true, message: 'Committee member added.', data: member });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Committee.findById(id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    if (member.imageKitFileId) await deleteFileFromImageKit(member.imageKitFileId);
    await Committee.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Committee member deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MODULE 4: SPONSORS & PARTNERS DIRECTORY
// ==========================================

export const getAdminSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: sponsors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminSponsor = async (req, res) => {
  try {
    let logoUrl = req.body.logoUrl || req.body.logo || '';
    let imageKitFileId = '';

    if (req.file) {
      const uploadResult = await uploadFileToImageKit(req.file.buffer, `sponsor_${req.body.name || 'logo'}`, '/cxoconnect/sponsors/');
      logoUrl = uploadResult.url;
      imageKitFileId = uploadResult.fileId;
    }

    const sponsor = new Sponsor({
      name: req.body.name,
      tier: req.body.tier || 'partner',
      logoUrl,
      imageKitFileId,
      logo: logoUrl,
      websiteUrl: req.body.websiteUrl || req.body.website || '',
      website: req.body.websiteUrl || req.body.website || '',
      description: req.body.description || ''
    });

    await sponsor.save();
    return res.status(201).json({ success: true, message: 'Sponsor added successfully.', data: sponsor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) return res.status(404).json({ success: false, message: 'Sponsor not found.' });

    if (req.file) {
      if (sponsor.imageKitFileId) await deleteFileFromImageKit(sponsor.imageKitFileId);
      const uploadResult = await uploadFileToImageKit(req.file.buffer, `sponsor_${req.body.name || sponsor.name}`, '/cxoconnect/sponsors/');
      sponsor.logoUrl = uploadResult.url;
      sponsor.imageKitFileId = uploadResult.fileId;
      sponsor.logo = uploadResult.url;
    }

    if (req.body.name) sponsor.name = req.body.name;
    if (req.body.tier) sponsor.tier = req.body.tier;
    if (req.body.websiteUrl || req.body.website) {
      sponsor.websiteUrl = req.body.websiteUrl || req.body.website;
      sponsor.website = sponsor.websiteUrl;
    }
    if (req.body.description !== undefined) sponsor.description = req.body.description;

    await sponsor.save();
    return res.status(200).json({ success: true, message: 'Sponsor updated successfully.', data: sponsor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) return res.status(404).json({ success: false, message: 'Sponsor not found.' });

    if (sponsor.imageKitFileId) await deleteFileFromImageKit(sponsor.imageKitFileId);
    await Sponsor.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Sponsor removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MODULE 5: TESTIMONIALS ENGINE
// ==========================================

export const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminTestimonial = async (req, res) => {
  try {
    let avatarUrl = req.body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80';
    let imageKitFileId = '';

    if (req.file) {
      const uploadResult = await uploadFileToImageKit(req.file.buffer, `testimonial_${req.body.authorName || 'avatar'}`, '/cxoconnect/testimonials/');
      avatarUrl = uploadResult.url;
      imageKitFileId = uploadResult.fileId;
    }

    const testimonial = new Testimonial({
      authorName: req.body.authorName,
      authorRole: req.body.authorRole || 'C-Suite Executive',
      company: req.body.company || '',
      city: req.body.city || '',
      avatarUrl,
      imageKitFileId,
      content: req.body.content,
      videoUrl: req.body.videoUrl || '',
      featured: req.body.featured !== undefined ? req.body.featured : true
    });

    await testimonial.save();
    return res.status(201).json({ success: true, message: 'Testimonial created.', data: testimonial });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found.' });

    if (req.file) {
      if (testimonial.imageKitFileId) await deleteFileFromImageKit(testimonial.imageKitFileId);
      const uploadResult = await uploadFileToImageKit(req.file.buffer, `testimonial_${req.body.authorName || testimonial.authorName}`, '/cxoconnect/testimonials/');
      testimonial.avatarUrl = uploadResult.url;
      testimonial.imageKitFileId = uploadResult.fileId;
    }

    if (req.body.authorName) testimonial.authorName = req.body.authorName;
    if (req.body.authorRole) testimonial.authorRole = req.body.authorRole;
    if (req.body.company !== undefined) testimonial.company = req.body.company;
    if (req.body.city !== undefined) testimonial.city = req.body.city;
    if (req.body.content) testimonial.content = req.body.content;
    if (req.body.videoUrl !== undefined) testimonial.videoUrl = req.body.videoUrl;

    await testimonial.save();
    return res.status(200).json({ success: true, message: 'Testimonial updated.', data: testimonial });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found.' });

    if (testimonial.imageKitFileId) await deleteFileFromImageKit(testimonial.imageKitFileId);
    await Testimonial.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MODULE 6: EVENTS & CONCLAVES MANAGEMENT
// ==========================================

export const getAdminEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type && type !== 'all') {
      query.type = type.toUpperCase();
    }
    const events = await Event.find(query).sort({ eventDate: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminEvent = async (req, res) => {
  try {
    let bannerUrl = req.body.bannerUrl || req.body.banner || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80';
    let imageKitFileId = '';
    const galleryUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.fieldname === 'banner' || file.fieldname === 'image') {
          const uploadResult = await uploadFileToImageKit(file.buffer, `event_banner_${Date.now()}`, '/cxoconnect/events/');
          bannerUrl = uploadResult.url;
          imageKitFileId = uploadResult.fileId;
        } else if (file.fieldname === 'gallery' || file.fieldname.startsWith('gallery[')) {
          const uploadResult = await uploadFileToImageKit(file.buffer, `event_gallery_${Date.now()}`, '/cxoconnect/events/gallery/');
          galleryUrls.push(uploadResult.url);
        }
      }
    } else if (req.file) {
      const uploadResult = await uploadFileToImageKit(req.file.buffer, `event_banner_${Date.now()}`, '/cxoconnect/events/');
      bannerUrl = uploadResult.url;
      imageKitFileId = uploadResult.fileId;
    }

    let bodyGallery = [];
    if (Array.isArray(req.body.gallery)) {
      bodyGallery = req.body.gallery;
    } else if (typeof req.body.gallery === 'string') {
      try {
        bodyGallery = JSON.parse(req.body.gallery);
      } catch (e) {
        if (req.body.gallery.trim()) bodyGallery = [req.body.gallery.trim()];
      }
    }
    const finalGallery = [...bodyGallery, ...galleryUrls];

    const eventDate = req.body.eventDate ? new Date(req.body.eventDate) : (req.body.date ? new Date(req.body.date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    const type = req.body.type ? req.body.type.toUpperCase() : eventDate > new Date() ? 'UPCOMING' : 'PAST';

    const event = new Event({
      title: req.body.title,
      speakerMentor: req.body.speakerMentor || req.body.mentorName || '',
      location: req.body.location || 'Mumbai, India',
      venue: req.body.venue || 'The Taj Mahal Palace',
      eventDate,
      date: req.body.date || eventDate.toDateString(),
      time: req.body.time || '09:30 AM - 04:30 PM IST',
      type,
      category: req.body.category || 'Leadership Summit',
      bannerUrl,
      imageKitFileId,
      banner: bannerUrl,
      gallery: finalGallery,
      registrationUrl: req.body.registrationUrl || '',
      description: req.body.description || 'Exclusive CXO Conclave and Networking Summit'
    });

    await event.save();
    return res.status(201).json({ success: true, message: 'Executive Conclave created.', data: event });
  } catch (error) {
    console.error('[createAdminEvent Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const galleryUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.fieldname === 'banner' || file.fieldname === 'image') {
          if (event.imageKitFileId) await deleteFileFromImageKit(event.imageKitFileId);
          const uploadResult = await uploadFileToImageKit(file.buffer, `event_banner_${Date.now()}`, '/cxoconnect/events/');
          event.bannerUrl = uploadResult.url;
          event.imageKitFileId = uploadResult.fileId;
          event.banner = uploadResult.url;
        } else if (file.fieldname === 'gallery' || file.fieldname.startsWith('gallery[')) {
          const uploadResult = await uploadFileToImageKit(file.buffer, `event_gallery_${Date.now()}`, '/cxoconnect/events/gallery/');
          galleryUrls.push(uploadResult.url);
        }
      }
    } else if (req.file) {
      if (event.imageKitFileId) await deleteFileFromImageKit(event.imageKitFileId);
      const uploadResult = await uploadFileToImageKit(req.file.buffer, `event_banner_${Date.now()}`, '/cxoconnect/events/');
      event.bannerUrl = uploadResult.url;
      event.imageKitFileId = uploadResult.fileId;
      event.banner = uploadResult.url;
    }

    if (galleryUrls.length > 0) {
      event.gallery = [...(event.gallery || []), ...galleryUrls];
    }
    if (req.body.gallery) {
      let bodyGallery = [];
      if (Array.isArray(req.body.gallery)) bodyGallery = req.body.gallery;
      else if (typeof req.body.gallery === 'string') {
        try { bodyGallery = JSON.parse(req.body.gallery); } catch (e) { if (req.body.gallery.trim()) bodyGallery = [req.body.gallery.trim()]; }
      }
      if (bodyGallery.length > 0) event.gallery = bodyGallery;
    }

    if (req.body.title) event.title = req.body.title;
    if (req.body.speakerMentor !== undefined || req.body.mentorName !== undefined) {
      event.speakerMentor = req.body.speakerMentor || req.body.mentorName || '';
    }
    if (req.body.location) event.location = req.body.location;
    if (req.body.venue) event.venue = req.body.venue;
    if (req.body.eventDate) {
      event.eventDate = new Date(req.body.eventDate);
      event.date = event.eventDate.toDateString();
    }
    if (req.body.date) event.date = req.body.date;
    if (req.body.time) event.time = req.body.time;
    if (req.body.type) event.type = req.body.type.toUpperCase();
    if (req.body.category) event.category = req.body.category;
    if (req.body.description) event.description = req.body.description;
    if (req.body.registrationUrl !== undefined) event.registrationUrl = req.body.registrationUrl;

    await event.save();
    return res.status(200).json({ success: true, message: 'Event updated.', data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.imageKitFileId) await deleteFileFromImageKit(event.imageKitFileId);
    await Event.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MODULE 7: QUIZ MANAGEMENT SYSTEM
// ==========================================

export const getAdminQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswerIndex = 0, category = 'Leadership' } = req.body;

    if (!questionText || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Question must have text and at least 2 options.' });
    }

    const question = new Question({
      questionText,
      options,
      correctAnswerIndex: Number(correctAnswerIndex) || 0,
      category
    });

    await question.save();
    return res.status(201).json({ success: true, message: 'Assessment question created.', data: question });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, options, correctAnswerIndex, category } = req.body;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });

    if (questionText) question.questionText = questionText;
    if (options && Array.isArray(options)) question.options = options;
    if (correctAnswerIndex !== undefined) question.correctAnswerIndex = Number(correctAnswerIndex);
    if (category) question.category = category;

    await question.save();
    return res.status(200).json({ success: true, message: 'Question updated.', data: question });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await Question.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Question deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// MODULE 8: MASS MAILER / BROADCAST MODULE
// ==========================================

export const sendMassMail = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message body are required.' });
    }

    // Fetch all approved platform members
    const approvedMembers = await User.find({ status: 'accepted' }, 'email name');
    const recipientEmails = approvedMembers.map((u) => u.email).filter(Boolean);

    if (recipientEmails.length === 0) {
      return res.status(400).json({ success: false, message: 'No approved members to broadcast to.' });
    }

    const mailer = await getMailerTransporter();
    const fromAddress = process.env.FROM_EMAIL || '"CXO Connect" <thecxoconnect@gmail.com>';

    // Format HTML email matching CXO Connect branding
    const formattedHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F7F4; margin: 0; padding: 30px;">
        <table align="center" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color: #111315; padding: 24px 32px; text-align: left;">
              <span style="color: #D99B26; font-size: 11px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase;">EXECUTIVE ADVISORY BROADCAST</span>
              <h2 style="color: #ffffff; margin: 6px 0 0 0; font-size: 20px; font-weight: 800;">CXO Connect</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; color: #111315; font-size: 15px; line-height: 1.6;">
              <h3 style="margin-top: 0; color: #111315; font-size: 18px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px;">${subject}</h3>
              <div style="margin-top: 16px; color: #334155;">
                ${message}
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F7F7F4; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748B;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} CXO Connect. Premier Executive Network.</p>
              <p style="margin: 4px 0 0 0;">This confidential broadcast was sent to verified members.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send broadcast via Nodemailer with BCC to protect recipient privacy
    await mailer.sendMail({
      from: fromAddress,
      to: process.env.EMAIL_USER || 'thecxoconnect@gmail.com', // Primary sender destination
      bcc: recipientEmails,                                    // Confidential BCC list
      subject: `[CXO Connect Executive Broadcast] ${subject}`,
      html: formattedHtml
    });

    console.log(`[Mass Mailer] Broadcast dispatched to ${recipientEmails.length} approved members.`);

    return res.status(200).json({
      success: true,
      message: `Broadcast successfully sent to ${recipientEmails.length} approved members.`,
      recipientCount: recipientEmails.length
    });
  } catch (error) {
    console.error('[Mass Mailer Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
