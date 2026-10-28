import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Shield, Linkedin, Sparkles } from 'lucide-react';
import { authService } from '../services/api';
import { useToast } from '../components/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member'); // 'member' | 'admin'
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your executive email address.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.manualAuth(email, role);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        sessionStorage.setItem('cxo_temp_token', res.data.token);
        sessionStorage.setItem('cxo_verify_email', res.data.email);
        if (res.data.devOtp) {
          sessionStorage.setItem('cxo_dev_otp', res.data.devOtp);
        }
        navigate(`/verify-otp?email=${encodeURIComponent(res.data.email)}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to dispatch verification code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetEmail, presetRole) => {
    setEmail(presetEmail);
    setRole(presetRole);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F7F4]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-[#E2E8F0]">
        
        {/* Brand Header with Gold Ring Icon */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#111315] flex items-center justify-center shadow-sm mb-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#D99B26] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#D99B26]" />
            </div>
          </div>
          <span className="category-subtitle">
            Executive Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] tracking-tight font-heading mt-1">
            Sign In to CXO Connect
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Access your member dashboard, private conclaves, and peer advisory.
          </p>
        </div>

        {/* Quick Testing Presets */}
        <div className="p-3.5 bg-[#F7F7F4] border border-[#E2E8F0] rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#111315]">
            <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
            <span>Fast-Track Credentials:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handlePresetSelect('theanvisharma@gmail.com', 'admin')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#111315] font-semibold hover:border-[#D99B26] hover:text-[#D99B26] transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('admin@cxoconnect.com', 'admin')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#111315] font-semibold hover:border-[#D99B26] hover:text-[#D99B26] transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('rajesh.singhania@apextech.com', 'member')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#111315] font-semibold hover:border-[#D99B26] hover:text-[#D99B26] transition-colors"
            >
              C-Suite Member
            </button>
          </div>
        </div>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-2">
              Corporate / Executive Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:ring-2 focus:ring-[#D99B26] focus:outline-none bg-[#F7F7F4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-2">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  role === 'member'
                    ? 'bg-[#111315] text-[#D99B26] border-[#111315]'
                    : 'bg-[#F7F7F4] text-[#64748B] border-[#E2E8F0] hover:bg-white'
                }`}
              >
                C-Suite Member
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  role === 'admin'
                    ? 'bg-[#111315] text-[#D99B26] border-[#111315]'
                    : 'bg-[#F7F7F4] text-[#64748B] border-[#E2E8F0] hover:bg-white'
                }`}
              >
                Platform Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-charcoal w-full py-3.5 rounded-full text-xs font-bold"
          >
            {loading ? (
              <span>Dispatching Code...</span>
            ) : (
              <>
                <span>Send 6-Digit Verification Code</span>
                <ArrowRight className="w-4 h-4 text-[#D99B26]" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-[#64748B] font-semibold">Or Connect With</span>
          </div>
        </div>

        {/* LinkedIn OAuth */}
        <a
          href="/api/auth/linkedin"
          className="btn-outline-executive w-full py-3 rounded-full text-xs font-bold"
        >
          <Linkedin className="w-4 h-4 text-[#0077b5]" />
          <span>Authenticate with LinkedIn</span>
        </a>

        {/* Security Assurance */}
        <div className="pt-2 text-center text-xs text-[#64748B] flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#D99B26]" />
          <span>256-bit encrypted passwordless executive verification</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
