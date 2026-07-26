// FILE INI HARUS DI: app/(auth)/forgot-password/page.tsx

import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Lupa Password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

