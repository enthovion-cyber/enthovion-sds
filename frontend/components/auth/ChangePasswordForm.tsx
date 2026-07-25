'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import authService from '@/services/authService';

const schema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword:     z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type Form = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await authService.changePassword(data);
      toast.success('Password changed successfully');
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-900 mb-5">Change password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <Input label="Current password" type="password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <Input label="New password" type="password" error={errors.newPassword?.message}
          helperText="At least 8 characters with uppercase and a number" {...register('newPassword')} />
        <Input label="Confirm new password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" isLoading={loading}>Update password</Button>
      </form>
    </Card>
  );
}
