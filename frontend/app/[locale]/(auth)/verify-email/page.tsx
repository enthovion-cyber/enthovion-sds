'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/authService';
import Spinner from '@/components/ui/Spinner';
import { useLocale } from '@/hooks/useLocale';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }
    authService.verifyEmail(token)
      .then((r) => { setStatus('success'); setMessage(r.data.message); })
      .catch((e) => { setStatus('error'); setMessage(e?.response?.data?.message || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
      {status === 'loading' && <><Spinner size={28} className="mx-auto mb-4" /><p className="text-sm text-gray-600">Verifying your email...</p></>}
      {status === 'success' && (
        <>
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Email verified!</h1>
          <p className="text-sm text-gray-600 mb-5">{message}</p>
          <Link href={`/${locale}/login`} className="text-sm font-medium text-gray-900 underline">Sign in to your account</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Verification failed</h1>
          <p className="text-sm text-gray-600 mb-5">{message}</p>
          <Link href={`/${locale}/login`} className="text-sm font-medium text-gray-900 underline">Back to sign in</Link>
        </>
      )}
    </div>
  );
}
