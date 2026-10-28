import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Building2, MapPin, Phone, Linkedin, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ImageKitUpload from '../components/ImageKitUpload';

const CompleteProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    position: user?.position || '',
    company: user?.company || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    profileImage: user?.profileImage || ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.position || !formData.company) {
      addToast('Name, Position/Title, and Company are required.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authService.completeProfile(formData);
      if (res.data.success) {
        addToast('Executive profile completed successfully!', 'success');
        updateUser(res.data.user);
        navigate('/profile');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F7F4] flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-[#E2E8F0]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F7F4] border border-[#E2E8F0] text-[#D99B26] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
            <span>Executive Credentialing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] font-heading tracking-tight">
            Complete Your Executive Profile
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
            Provide your leadership credentials to finalize your verification with the CXO Connect admissions committee.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Profile Image Upload */}
          <div className="flex justify-center pb-2">
            <ImageKitUpload
              label="Executive Headshot"
              initialImage={formData.profileImage}
              onUploadSuccess={handleImageUpload}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Vikramaditya Mehta"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
              </div>
            </div>

            {/* Title / Position */}
            <div>
              <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                Executive Title / Position *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g. Chief Executive Officer / VP"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                Organization / Company *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Apex Global Technologies"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                Metropolitan Chapter *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai / Bengaluru / Delhi"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                Postal / Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 400051"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98200 00000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
                />
              </div>
            </div>
          </div>

          {/* LinkedIn Profile */}
          <div>
            <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-1.5">
              LinkedIn Public Profile URL
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3.5 top-3 w-4 h-4 text-[#0077b5]" />
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-executive-profile"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-charcoal w-full py-3.5 rounded-full text-xs font-bold"
          >
            {submitting ? (
              <span>Saving Profile...</span>
            ) : (
              <>
                <span>Save Credentials & Access Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#D99B26]" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CompleteProfile;
