'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import authService from '@/services/authService';
import { useLocale } from '@/hooks/useLocale';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const { locale } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: Form) => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('If that account exists, you will receive a reset code');
      // Store email for OTP page
      sessionStorage.setItem('reset_email', email);
      router.push(`/${locale}/verify-otp`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Reset your password</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your email and we&apos;ll send a 6-digit reset code</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" isLoading={loading}>Send reset code</Button>
      </form>
      <p className="text-sm text-center text-gray-500 mt-5">
        <Link href={`/${locale}/login`} className="text-gray-900 font-medium hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
