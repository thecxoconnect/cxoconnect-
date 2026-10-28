import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Shield, Linkedin, Sparkles, CheckCircle2 } from 'lucide-react';
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
        // Store verification token temporarily for OTP step
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
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-serif font-black text-base shadow-md mb-3">
            CXO
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Executive Login
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Access your CXO Connect member dashboard, private roundtables, and peer advisory.
          </p>
        </div>

        {/* Quick Testing Presets */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Fast-Track Credentials:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handlePresetSelect('theanvisharma@gmail.com', 'admin')}
              className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-950 font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('admin@cxoconnect.com', 'admin')}
              className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-950 font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('rajesh.singhania@apextech.com', 'member')}
              className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-950 font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              C-Suite Member
            </button>
          </div>
        </div>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  role === 'member'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                C-Suite Member
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  role === 'admin'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Platform Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#0d1527] hover:bg-[#1a2642] text-white font-semibold text-sm transition-all shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            {loading ? (
              <span>Dispatching Code...</span>
            ) : (
              <>
                <span>Send 6-Digit Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or Connect With</span>
          </div>
        </div>

        {/* LinkedIn OAuth Option */}
        <a
          href="/api/auth/linkedin"
          className="w-full py-3 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Linkedin className="w-4 h-4 text-[#0077b5]" />
          <span>Authenticate with LinkedIn</span>
        </a>

        {/* Security Assurance */}
        <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit encrypted passwordless executive verification</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
