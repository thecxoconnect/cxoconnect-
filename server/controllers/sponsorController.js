import Sponsor from '../models/Sponsor.js';

export const getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ order: 1, createdAt: 1 });

    // Group by tier
    const grouped = {
      strategicPartners: sponsors.filter(s => s.tier === 'Strategic Partner'),
      platinumSponsors: sponsors.filter(s => s.tier === 'Platinum Sponsor'),
      goldSponsors: sponsors.filter(s => s.tier === 'Gold Sponsor'),
      knowledgePartners: sponsors.filter(s => s.tier === 'Knowledge Partner' || s.tier === 'Silver Sponsor')
    };

    return res.status(200).json({
      success: true,
      count: sponsors.length,
      grouped,
      data: sponsors
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve corporate sponsors.',
      error: error.message
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
