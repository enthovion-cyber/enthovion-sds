'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import userService from '@/services/userService';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', company: '', phone: '', jobTitle: '' } });

  useEffect(() => {
    if (user) reset({ name: user.name, company: user.company || '', phone: user.phone || '', jobTitle: user.jobTitle || '' });
  }, [user]);

  const onSubmit = async (data: any) => {
    try {
      const { data: res } = await userService.updateProfile(data);
      setUser(res.data);
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-5">Profile settings</h1>
      <Card>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-white text-xl font-semibold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded mt-1 inline-block">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <Input label="Full name" {...register('name')} />
          <Input label="Company" {...register('company')} />
          <Input label="Phone" type="tel" {...register('phone')} />
          <Input label="Job title" {...register('jobTitle')} />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
