import type { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Daftar',
};

export default function SignupPage() {
  return <SignupForm />;
}

