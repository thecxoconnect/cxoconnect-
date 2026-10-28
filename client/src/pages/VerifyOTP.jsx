import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, RotateCw, Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { addToast } = useToast();

  const emailParam = searchParams.get('email') || sessionStorage.getItem('cxo_verify_email') || '';
  const tempToken = sessionStorage.getItem('cxo_temp_token') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!emailParam) {
      navigate('/login');
    }
  }, [emailParam, navigate]);

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
      addToast('Please enter the complete 6-digit numeric verification code.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyOTP(emailParam, otpCode, tempToken);
      if (res.data.success) {
        addToast('Verification successful. Welcome to CXO Connect!', 'success');
        loginWithToken(res.data.token, res.data.user);

        sessionStorage.removeItem('cxo_temp_token');
        sessionStorage.removeItem('cxo_verify_email');
        sessionStorage.removeItem('cxo_dev_otp');

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
        addToast('New 6-digit verification code dispatched.', 'success');
        setTimeLeft(600);
        setOtp(['', '', '', '', '', '']);
        if (res.data.devOtp) {
          sessionStorage.setItem('cxo_dev_otp', res.data.devOtp);
        }
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
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F7F4]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-[#E2E8F0]">
        
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#111315] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>

          <div className="w-12 h-12 rounded-full bg-[#111315] text-[#D99B26] flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <span className="category-subtitle">
            One-Time Password
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111315] tracking-tight font-heading mt-1">
            Verify Your Email
          </h2>
          <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
            We sent a 6-digit verification code to{' '}
            <strong className="text-[#111315]">{emailParam}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 Digit Input Group */}
          <div>
            <label className="block text-xs font-bold text-[#111315] uppercase tracking-wider mb-3">
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
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-[#E2E8F0] focus:border-[#D99B26] focus:ring-2 focus:ring-[#D99B26]/20 focus:outline-none transition-all bg-[#F7F7F4]"
                />
              ))}
            </div>

            {sessionStorage.getItem('cxo_dev_otp') && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    const devCode = sessionStorage.getItem('cxo_dev_otp');
                    if (devCode && devCode.length === 6) {
                      setOtp(devCode.split(''));
                    }
                  }}
                  className="px-3 py-1 rounded-full bg-[#F7F7F4] hover:bg-slate-200 text-[#111315] text-xs font-semibold border border-[#E2E8F0] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Quick-fill test code:</span>
                  <strong className="tracking-widest font-mono text-[#D99B26]">{sessionStorage.getItem('cxo_dev_otp')}</strong>
                </button>
              </div>
            )}
          </div>

          {/* Countdown & Resend */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B]">
              Expires in: <strong className="text-[#111315]">{formatTime(timeLeft)}</strong>
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || timeLeft > 540}
              className="text-[#D99B26] hover:text-[#C2871E] font-bold flex items-center gap-1 disabled:opacity-40"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="btn-charcoal w-full py-3.5 rounded-full text-xs font-bold disabled:opacity-50"
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

        <div className="pt-2 text-center text-[11px] text-[#64748B]">
          Didn't receive an email? Check your spam folder or verify email accuracy.
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
