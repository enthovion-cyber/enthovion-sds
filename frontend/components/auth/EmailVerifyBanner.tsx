'use client';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import authService from '@/services/authService';

export default function EmailVerifyBanner() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      await authService.resendVerify();
      setSent(true);
      toast.success('Verification email sent. Please check your inbox.');
    } catch { toast.error('Failed to resend. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 mb-4">
      <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-800 flex-1">Please verify your email address to access all features.</p>
      {!sent && (
        <Button variant="outline" size="sm" onClick={resend} isLoading={loading}>
          Resend email
        </Button>
      )}
      {sent && <span className="text-sm text-amber-700 font-medium">Email sent!</span>}
    </div>
  );
}
