'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import authService from '@/services/authService';
import { useLocale } from '@/hooks/useLocale';

export default function OtpVerifyForm() {
  const { locale } = useLocale();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 min
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const email = typeof window !== 'undefined' ? sessionStorage.getItem('reset_email') || '' : '';

  useEffect(() => {
    const t = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp({ email, otp: code });
      sessionStorage.setItem('reset_token', data.data.resetToken);
      router.push(`/${locale}/reset-password`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
  const seconds = (timer % 60).toString().padStart(2, '0');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Enter verification code</h1>
        <p className="text-sm text-gray-500 mt-1">We sent a 6-digit code to <strong>{email}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          ))}
        </div>

        <p className={`text-sm text-center ${timer < 60 ? 'text-red-500' : 'text-gray-500'}`}>
          Code expires in <strong>{minutes}:{seconds}</strong>
        </p>

        <Button type="submit" className="w-full" isLoading={loading} disabled={timer === 0}>
          Verify code
        </Button>
      </form>
    </div>
  );
}
