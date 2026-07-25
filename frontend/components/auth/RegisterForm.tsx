'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Use this for App Router
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 1. Define Schema
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  company: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Need uppercase').regex(/[0-9]/, 'Need number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { 
  message: 'Passwords do not match', 
  path: ['confirmPassword'] 
});

type Form = z.infer<typeof schema>;

export default function RegisterForm() {
  // 2. Separate logic: Get register function, but ignore the hook's isLoading
  const { register: doRegister } = useAuth();
  
  // 3. Local Loading State (Prevents automatic spinner on page load)
  const [isPending, setIsPending] = useState(false);
  
  // 4. App Router Locale Access
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isAr = locale === 'ar';

  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ 
    resolver: zodResolver(schema) 
  });

  // 5. Submit Handler
  const onSubmit = async (data: Form) => {
    setIsPending(true); // Manually start loading
    try { 
      await doRegister(data, locale); 
      // If successful, the app usually redirects via middleware or internal logic
    } catch (err) {
      console.error("Registration failed", err);
      setIsPending(false); // Stop loading only if there's an error
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {isAr ? 'إنشاء حسابك' : 'Create your account'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAr ? 'ابدأ في إدارة مستندات السلامة الكيميائية بالذكاء الاصطناعي' : 'Start managing chemical safety documents with AI'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label={isAr ? "الاسم الكامل" : "Full name"} 
          placeholder={isAr ? "الاسم" : "Jane Smith"} 
          error={errors.name?.message} 
          {...register('name')} 
        />

        <Input 
          label={isAr ? "البريد الإلكتروني للعمل" : "Work email"} 
          type="email" 
          placeholder="jane@company.com" 
          error={errors.email?.message} 
          {...register('email')} 
        />

        <Input 
          label={isAr ? "الشركة (اختياري)" : "Company (optional)"} 
          placeholder="Acme Chemical Co." 
          {...register('company')} 
        />

        <div className="relative">
          <Input 
            label={isAr ? "كلمة المرور" : "Password"} 
            type={showPass ? 'text' : 'password'} 
            placeholder="••••••••"
            error={errors.password?.message} 
            helperText={isAr ? "8 أحرف على الأقل مع حرف كبير ورقم" : "At least 8 characters with uppercase and a number"} 
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

        <Input 
          label={isAr ? "تأكيد كلمة المرور" : "Confirm password"} 
          type="password" 
          placeholder="••••••••" 
          error={errors.confirmPassword?.message} 
          {...register('confirmPassword')} 
        />

        {/* 6. Use local isPending for the spinner */}
        <Button type="submit" className="w-full" isLoading={isPending}>
          {isAr ? 'إنشاء الحساب' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-5">
        {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
        <Link href={`/${locale}/login`} className="text-gray-900 font-medium hover:underline">
          {isAr ? 'تسجيل الدخول' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}