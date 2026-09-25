import * as z from 'zod';

export const signInSchema = z.object({
  owner_phone: z
    .string()
    .trim()
    .min(9, 'Authorized owner phone number is required')
    .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format. Use numeric digits only (e.g., +251911223344)'),
  password: z.string().min(1, 'Access key credential signature required'),
});

export const registerSchema = z.object({
  zone_name: z.string().min(3, 'Venue name identity must be at least 3 characters'),
  address: z.string().min(4, 'Physical allocation address profile parameters required'),
  owner_name: z.string().min(3, 'Administrator signature name must be at least 3 characters'),
  owner_phone: z
    .string()
    .trim()
    .min(9, 'Please map a valid physical terminal phone line')
    .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format. Use numeric digits only (e.g., +251911223344)'),
  password: z.string().min(6, 'Access token password must exceed 5 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your validation password signature'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Security key specifications parameters mismatch",
  path: ["confirmPassword"],
});
