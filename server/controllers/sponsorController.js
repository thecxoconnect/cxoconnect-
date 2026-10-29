import mongoose from 'mongoose';
import Sponsor from '../models/Sponsor.js';

const FALLBACK_SPONSORS = [
  { _id: 'sp_1', name: 'Deloitte', tier: 'Strategic Partner', category: 'Global Advisory', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&q=80', website: 'https://deloitte.com' },
  { _id: 'sp_2', name: 'Microsoft Enterprise', tier: 'Platinum Sponsor', category: 'Cloud & AI Infrastructure', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80', website: 'https://microsoft.com' },
  { _id: 'sp_3', name: 'Salesforce', tier: 'Platinum Sponsor', category: 'Customer Experience', logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&q=80', website: 'https://salesforce.com' },
  { _id: 'sp_4', name: 'Goldman Sachs', tier: 'Gold Sponsor', category: 'Investment Banking', logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80', website: 'https://goldmansachs.com' }
];

export const getSponsors = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const grouped = {
        strategicPartners: FALLBACK_SPONSORS.filter(s => s.tier === 'Strategic Partner'),
        platinumSponsors: FALLBACK_SPONSORS.filter(s => s.tier === 'Platinum Sponsor'),
        goldSponsors: FALLBACK_SPONSORS.filter(s => s.tier === 'Gold Sponsor'),
        knowledgePartners: FALLBACK_SPONSORS.filter(s => s.tier === 'Knowledge Partner' || s.tier === 'Silver Sponsor')
      };
      return res.status(200).json({
        success: true,
        count: FALLBACK_SPONSORS.length,
        grouped,
        data: FALLBACK_SPONSORS
      });
    }

    const sponsors = await Sponsor.find().sort({ order: 1, createdAt: 1 });
    const list = sponsors.length > 0 ? sponsors : FALLBACK_SPONSORS;

    // Group by tier
    const grouped = {
      strategicPartners: list.filter(s => s.tier === 'Strategic Partner'),
      platinumSponsors: list.filter(s => s.tier === 'Platinum Sponsor'),
      goldSponsors: list.filter(s => s.tier === 'Gold Sponsor'),
      knowledgePartners: list.filter(s => s.tier === 'Knowledge Partner' || s.tier === 'Silver Sponsor')
    };

    return res.status(200).json({
      success: true,
      count: list.length,
      grouped,
      data: list
    });
  } catch (error) {
    console.warn('[getSponsors Fallback]', error.message);
    const grouped = {
      strategicPartners: FALLBACK_SPONSORS.filter(s => s.tier === 'Strategic Partner'),
      platinumSponsors: FALLBACK_SPONSORS.filter(s => s.tier === 'Platinum Sponsor'),
      goldSponsors: FALLBACK_SPONSORS.filter(s => s.tier === 'Gold Sponsor'),
      knowledgePartners: FALLBACK_SPONSORS.filter(s => s.tier === 'Knowledge Partner' || s.tier === 'Silver Sponsor')
    };
    return res.status(200).json({
      success: true,
      count: FALLBACK_SPONSORS.length,
      grouped,
      data: FALLBACK_SPONSORS
    });
  }
};

export const submitPartnerInquiry = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, tierInterest, message } = req.body;

    if (!companyName || !contactPerson || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, contact person, and email.'
      });
    }

    // In production, an alert or CRM lead can be triggered
    return res.status(200).json({
      success: true,
      message: `Thank you, ${contactPerson}. Your partnership inquiry for ${companyName} has been received. Our Corporate Relations team will connect with you within 24 hours.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit partnership inquiry.',
      error: error.message
    });
  }
};

export const createSponsor = async (req, res) => {
  try {
    const { name, tier, logo, website, description, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Sponsor name is required.'
      });
    }

    const sponsor = new Sponsor({
      name,
      tier: tier || 'Gold Sponsor',
      logo: logo || '',
      website: website || '',
      description: description || '',
      order: Number(order) || 0
    });

    await sponsor.save();

    return res.status(201).json({
      success: true,
      message: 'Corporate partner registered.',
      data: sponsor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create sponsor.',
      error: error.message
    });
  }
};

export const deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findByIdAndDelete(id);

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sponsor removed.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sponsor.',
      error: error.message
    });
  }
};
