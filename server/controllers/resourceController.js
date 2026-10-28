import Framework from '../models/Framework.js';
import Certification from '../models/Certification.js';

export const getFrameworks = async (req, res) => {
  try {
    const frameworks = await Framework.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: frameworks.length, data: frameworks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: certifications.length, data: certifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
