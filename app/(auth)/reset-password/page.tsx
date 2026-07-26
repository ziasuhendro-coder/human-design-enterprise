// FILE INI HARUS DI: app/(auth)/reset-password/page.tsx

import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Buat Password Baru',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

