import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, RotateCw, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ConcentricEmblem } from '../components/BrandLogo';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { addToast } = useToast();

  const tokenParam = searchParams.get('token') || sessionStorage.getItem('cxo_temp_token') || '';
  const emailParam = searchParams.get('email') || sessionStorage.getItem('cxo_verify_email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!tokenParam && !emailParam) {
      navigate('/login');
    }
  }, [tokenParam, emailParam, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      addToast('Please enter the complete 6-digit verification code.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyOTP(emailParam, otpCode, tokenParam);
      if (res.data.success) {
        addToast('Verification successful. Welcome to CXO Connect!', 'success');
        loginWithToken(res.data.token, res.data.user);

        sessionStorage.removeItem('cxo_temp_token');
        sessionStorage.removeItem('cxo_verify_email');

        if (!res.data.user.profileComplete) {
          navigate('/complete-profile');
        } else if (res.data.user.role === 'admin' && res.data.user.status === 'accepted') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid or expired verification code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const res = await authService.resendOTP(emailParam);
      if (res.data.success) {
        addToast('New 6-digit verification code sent to your email.', 'success');
        setTimeLeft(600);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to resend code.', 'error');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E2E8F0] sm:px-10">
          
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#111315] transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>

          <div className="flex justify-center mb-4">
            <ConcentricEmblem size={52} />
          </div>

          <h2 className="text-center text-2xl sm:text-3xl font-serif font-extrabold text-[#111315]">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-xs text-[#64748B] leading-relaxed">
            We sent a 6-digit verification code to{' '}
            <strong className="text-[#111315]">{emailParam || 'your registered email'}</strong>.
          </p>

          <form onSubmit={handleVerify} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#64748B] mb-3 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-[#E2E8F0] focus:border-[#D99B26] focus:ring-2 focus:ring-[#D99B26]/20 focus:outline-none transition-all bg-[#F7F7F4]/50"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B]">
                Expires in: <strong className="text-[#111315] font-mono">{formatTime(timeLeft)}</strong>
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || timeLeft > 540}
                className="text-[#D99B26] hover:text-[#C2871E] font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 px-4 bg-[#111315] hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 border border-slate-700"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Complete Verification</span>
                  <ArrowRight className="w-4 h-4 text-[#D99B26]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Check your spam folder or verify email accuracy if code isn't in your inbox.
          </div>

        </div>
      </div>
    </div>
  );
}
