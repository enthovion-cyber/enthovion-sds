import { z } from 'zod';

export const emailSchema = z.string().email('Enter a valid email address').toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const confirmPasswordSchema = (field = 'password') =>
  z.string().refine((val) => val.length > 0, 'Please confirm your password');

export const casNumberSchema = z
  .string()
  .regex(/^\d{1,7}-\d{2}-\d$/, 'CAS number format must be XXXXXXX-XX-X')
  .optional()
  .or(z.literal(''));

export const requiredString = (msg = 'This field is required') =>
  z.string().min(1, msg);

export const optionalString = z.string().optional().or(z.literal(''));

// Validate file type client-side before upload
export const validateSdsFile = (file: File): string | null => {
  const allowed = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.tiff'];
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowed.includes(ext)) return `File type not allowed. Accepted: ${allowed.join(', ')}`;
  if (file.size > 20 * 1024 * 1024) return 'File too large. Maximum size is 20MB';
  return null;
};

export const isValidUuid = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
