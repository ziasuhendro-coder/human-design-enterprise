import { z } from 'zod';

/**
 * Skema validasi login. Pesan error dalam Bahasa Indonesia karena target
 * pasar utama aplikasi ini adalah Indonesia.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi')
    .max(72, 'Password terlalu panjang'), // 72 = batas praktis bcrypt
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Skema validasi signup. Kebijakan password: minimal 8 karakter, harus ada
 * huruf besar, huruf kecil, dan angka -- standar minimum enterprise yang
 * wajar tanpa membuat pengguna awam frustrasi (tidak mewajibkan simbol).
 */
export const signupSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Nama lengkap wajib diisi' })
      .min(2, 'Nama minimal 2 karakter')
      .max(150, 'Nama maksimal 150 karakter')
      .trim(),
    email: z
      .string({ required_error: 'Email wajib diisi' })
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid')
      .max(255, 'Email terlalu panjang')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password wajib diisi' })
      .min(8, 'Password minimal 8 karakter')
      .max(72, 'Password terlalu panjang')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string({ required_error: 'Konfirmasi password wajib diisi' }),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'Anda harus menyetujui Syarat & Ketentuan' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: 'Password wajib diisi' })
      .min(8, 'Password minimal 8 karakter')
      .max(72, 'Password terlalu panjang')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung angka'),
    confirmPassword: z.string({ required_error: 'Konfirmasi password wajib diisi' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
