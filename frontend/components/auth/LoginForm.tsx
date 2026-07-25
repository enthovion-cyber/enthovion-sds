'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type Form = z.infer<typeof schema>;

export default function LoginForm() {
  const { login } = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  
  // Local loading state to prevent "automatic" loading on page load
  const [isPending, setIsPending] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ 
    resolver: zodResolver(schema) 
  });

  const onSubmit = async (data: Form) => {
    setIsPending(true); // Start loading here
    try { 
      await login(data, locale); 
      // Navigation is usually handled inside useAuth or via middleware
    } catch (err) {
      console.error("Login failed", err);
      setIsPending(false); // Stop loading only if it fails
    }
  };

  const isAr = locale === 'ar';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {isAr ? 'مرحباً بك' : 'Welcome back'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAr ? 'قم بتسجيل الدخول إلى حسابك' : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label={isAr ? "البريد الإلكتروني" : "Email"} 
          type="email" 
          placeholder="you@company.com" 
          error={errors.email?.message} 
          {...register('email')} 
        />
        
        <div className="relative">
          <Input 
            label={isAr ? "كلمة المرور" : "Password"} 
            type={showPass ? 'text' : 'password'} 
            placeholder="••••••••" 
            error={errors.password?.message} 
            {...register('password')} 
          />
          <button 
            type="button" 
            onClick={() => setShowPass(!showPass)}
            className={`absolute ${isAr ? 'left-3' : 'right-3'} top-9 text-gray-400 hover:text-gray-600`}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className={`flex ${isAr ? 'justify-start' : 'justify-end'}`}>
          <Link href={`/${locale}/forgot-password`} className="text-sm text-gray-600 hover:text-gray-900">
            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </Link>
        </div>

        {/* Use isPending instead of isLoading from hook */}
        <Button type="submit" className="w-full" isLoading={isPending}>
          {isAr ? 'تسجيل الدخول' : 'Sign in'}
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-5">
        {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
        <Link href={`/${locale}/register`} className="text-gray-900 font-medium hover:underline">
           {isAr ? 'إنشاء حساب' : 'Sign up'}
        </Link>
      </p>
    </div>
  );
}