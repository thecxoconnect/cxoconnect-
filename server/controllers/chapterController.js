import Chapter from '../models/Chapter.js';

export const getChapters = async (req, res) => {
  try {
    let chapters = await Chapter.find().sort({ activeMembersCount: -1 });

    if (!chapters || chapters.length === 0) {
      chapters = [
        {
          _id: 'c1',
          city: 'Mumbai',
          country: 'India',
          leadName: 'Vikramaditya Mehta',
          leadEmail: 'mumbai@cxoconnect.com',
          activeMembersCount: 420,
          image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80'
        },
        {
          _id: 'c2',
          city: 'Delhi NCR',
          country: 'India',
          leadName: 'Priyanka Sen',
          leadEmail: 'delhi@cxoconnect.com',
          activeMembersCount: 380,
          image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80'
        },
        {
          _id: 'c3',
          city: 'Bengaluru',
          country: 'India',
          leadName: 'Karthik Ramanathan',
          leadEmail: 'bengaluru@cxoconnect.com',
          activeMembersCount: 510,
          image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80'
        },
        {
          _id: 'c4',
          city: 'Hyderabad',
          country: 'India',
          leadName: 'Ananya Reddy',
          leadEmail: 'hyderabad@cxoconnect.com',
          activeMembersCount: 290,
          image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&q=80'
        },
        {
          _id: 'c5',
          city: 'Singapore & APAC',
          country: 'Singapore',
          leadName: 'Marcus Chen',
          leadEmail: 'singapore@cxoconnect.com',
          activeMembersCount: 215,
          image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80'
        },
        {
          _id: 'c6',
          city: 'Dubai & MENA',
          country: 'UAE',
          leadName: 'Tariq Al-Mansoor',
          leadEmail: 'dubai@cxoconnect.com',
          activeMembersCount: 195,
          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80'
        }
      ];
    }

    return res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve regional chapters.',
      error: error.message
    });
  }
};

export const createChapter = async (req, res) => {
  try {
    const { city, country, leadName, leadEmail, activeMembersCount, image } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City name is required.'
      });
    }

    const chapter = new Chapter({
      city,
      country: country || 'India',
      leadName: leadName || '',
      leadEmail: leadEmail || '',
      activeMembersCount: Number(activeMembersCount) || 0,
      image: image || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80'
    });

    await chapter.save();

    return res.status(201).json({
      success: true,
      message: 'Regional chapter established.',
      data: chapter
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create chapter.',
      error: error.message
    });
  }
};
