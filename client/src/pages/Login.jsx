import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Shield, User, Sparkles } from 'lucide-react';
import { authService } from '../services/api';
import { useToast } from '../components/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [role, setRole] = useState('member'); // 'member' | 'admin'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your corporate email address.', 'warning');
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
    setShowEmailInput(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F7F4]">
      <div className="max-w-md w-full space-y-7 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-[#E2E8F0]">
        
        {/* Header: Shield Icon inside a soft blue pill + "Welcome to CXO Connect" (Serif) */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#EBF5FF] border border-[#BFDBFE] text-[#0066CC] shadow-sm mb-3">
            <Shield className="w-7 h-7 text-[#0066CC]" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-serif">
            Welcome to CXO Connect
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] font-medium">
            Select your role and sign in
          </p>
        </div>

        {/* Role Selector: Dual Pill Tabs [ 👤 Member ] vs [ 🛡️ Admin ] */}
        <div className="bg-[#F1F5F9] p-1.5 rounded-full flex items-center border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setRole('member')}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'member'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'bg-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Member</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'admin'
                ? 'bg-[#0066CC] text-white shadow-sm'
                : 'bg-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Fast-Track Testing Credentials */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
            <Sparkles className="w-3.5 h-3.5 text-[#0066CC]" />
            <span className="text-[11px] uppercase tracking-wider text-[#0066CC]">Verified Test Profiles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handlePresetSelect('theanvisharma@gmail.com', 'admin')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-[11px] hover:border-[#0066CC] hover:text-[#0066CC] transition-colors shadow-2xs"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('admin@cxoconnect.com', 'admin')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-[11px] hover:border-[#0066CC] hover:text-[#0066CC] transition-colors shadow-2xs"
            >
              Secondary Admin
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('rajesh.singhania@apextech.com', 'member')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-[11px] hover:border-[#0066CC] hover:text-[#0066CC] transition-colors shadow-2xs"
            >
              C-Suite Member
            </button>
          </div>
        </div>

        {/* Authentication Options (Strictly ONLY TWO: Google & Email OTP) */}
        <div className="space-y-3.5">
          {/* Option 1: Continue with Google */}
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#0F172A] text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </a>

          {/* Option 2: Continue with Email (Passwordless OTP) */}
          {!showEmailInput ? (
            <button
              type="button"
              onClick={() => setShowEmailInput(true)}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-[#0d1527] hover:bg-[#1a2744] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <Mail className="w-4 h-4 text-[#0066CC]" />
              <span>Continue with Email</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Corporate / Executive Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="leader@enterprise.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm focus:ring-2 focus:ring-[#0066CC] focus:outline-none bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow-sm"
              >
                {loading ? (
                  <span>Dispatching Code...</span>
                ) : (
                  <>
                    <span>Send 6-Digit OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Assurance */}
        <div className="pt-2 text-center text-xs text-[#64748B] flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#0066CC]" />
          <span>256-bit encrypted passwordless executive verification</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
