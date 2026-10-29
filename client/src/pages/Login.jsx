import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, UserCheck, Lock } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [role, setRole] = useState('member'); // 'member' | 'admin'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setError(decodeURIComponent(err));
    }
  }, []);

  const handleGoogleLogin = () => {
    const backendUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
    const targetUrl = backendUrl
      ? `${backendUrl}/api/auth/google?state=${role}`
      : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? `http://localhost:5000/api/auth/google?state=${role}`
          : `/api/auth/google?state=${role}`);
    window.location.href = targetUrl;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/manual', { email, role });
      if (res.data.token) {
        sessionStorage.setItem('cxo_temp_token', res.data.token);
        sessionStorage.setItem('cxo_verify_email', res.data.email || email);
        navigate(`/verify-otp?token=${encodeURIComponent(res.data.token)}&email=${encodeURIComponent(res.data.email || email)}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to dispatch verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-[#111315] flex items-center justify-center text-white shadow-lg border border-[#D99B26]/30">
            <Shield className="w-8 h-8 text-[#D99B26]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-extrabold text-[#111315]">
          Welcome to CXO Connect
        </h2>
        <p className="mt-2 text-center text-sm text-[#64748B]">
          Select your role and sign in to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E2E8F0] sm:px-10">
          
          {/* Dual Role Selector */}
          <div className="grid grid-cols-2 gap-2 bg-[#F7F7F4] p-1.5 rounded-xl mb-6 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                role === 'member'
                  ? 'bg-[#111315] text-[#D99B26] shadow-sm'
                  : 'text-[#64748B] hover:text-[#111315]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Member</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                role === 'admin'
                  ? 'bg-[#111315] text-[#D99B26] shadow-sm'
                  : 'text-[#64748B] hover:text-[#111315]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Auth Buttons */}
          <div className="space-y-4">
            
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E2E8F0] rounded-xl shadow-xs bg-white text-sm font-semibold text-[#111315] hover:bg-slate-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue as {role === 'admin' ? 'Admin' : 'Member'} with Google</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[#64748B] font-semibold">OR</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#D99B26] focus:border-transparent text-sm bg-[#F7F7F4]/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#111315] hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-slate-700"
              >
                {loading ? 'Dispatching Verification Code...' : 'Continue with Email OTP'}
              </button>
            </form>

          </div>

          <div className="mt-6 text-center text-xs text-[#64748B] flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#D99B26]" />
            <span>Strict single-source OTP verification enforced via Gmail</span>
          </div>

        </div>
      </div>
    </div>
  );
}
