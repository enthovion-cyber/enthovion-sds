'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import authService from '@/services/authService';
import { useLocale } from '@/hooks/useLocale';

const schema = z.object({
  newPassword:     z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type Form = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const { locale } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ newPassword, confirmPassword }: Form) => {
    const resetToken = sessionStorage.getItem('reset_token') || '';
    if (!resetToken) { toast.error('Reset session expired. Please start again.'); return; }
    setLoading(true);
    try {
      await authService.resetPassword({ resetToken, newPassword, confirmPassword });
      sessionStorage.removeItem('reset_token');
      sessionStorage.removeItem('reset_email');
      toast.success('Password reset successfully. Please sign in.');
      router.push(`/${locale}/login`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Set new password</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="New password" type="password" placeholder="Min 8 chars, uppercase + number"
          error={errors.newPassword?.message} helperText="At least 8 characters with uppercase and a number" {...register('newPassword')} />
        <Input label="Confirm password" type="password" placeholder="Repeat new password"
          error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" className="w-full" isLoading={loading}>Set new password</Button>
      </form>
    </div>
  );
}
