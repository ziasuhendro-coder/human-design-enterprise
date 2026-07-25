'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormAlert from '@/components/ui/FormAlert';
import { signupAction, type SignupActionState } from '@/app/(auth)/signup/actions';

const initialState: SignupActionState = { error: null, fieldErrors: null, success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      {pending ? 'Memproses...' : 'Buat Akun'}
    </Button>
  );
}

function PasswordStrengthHint({ password }: { password: string }) {
  const checks = [
    { label: 'Minimal 8 karakter', pass: password.length >= 8 },
    { label: 'Huruf besar', pass: /[A-Z]/.test(password) },
    { label: 'Huruf kecil', pass: /[a-z]/.test(password) },
    { label: 'Angka', pass: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {checks.map((c) => (
        <li
          key={c.label}
          className={c.pass ? 'text-success' : 'text-foreground-subtle'}
        >
          {c.pass ? '✓' : '○'} {c.label}
        </li>
      ))}
    </ul>
  );
}

export default function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initialState);
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push('/verify-email');
    }
  }, [state.success, router]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Buat akun baru
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Mulai perjalanan memahami desain energi Anda.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {state.error && <FormAlert type="error" message={state.error} />}

        <Input
          name="fullName"
          type="text"
          label="Nama Lengkap"
          placeholder="Nama Anda"
          autoComplete="name"
          error={state.fieldErrors?.fullName}
          required
        />

        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          autoComplete="email"
          error={state.fieldErrors?.email}
          required
        />

        <div>
          <Input
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={state.fieldErrors?.password}
            required
          />
          <PasswordStrengthHint password={password} />
        </div>

        <Input
          name="confirmPassword"
          type="password"
          label="Konfirmasi Password"
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
          required
        />

        <label className="flex items-start gap-2 text-sm text-foreground-muted">
          <input
            type="checkbox"
            name="agreeToTerms"
            className="mt-0.5 h-4 w-4 rounded border-border bg-surface accent-primary"
            required
          />
          <span>
            Saya menyetujui{' '}
            <Link href="/terms" className="text-primary hover:text-primary-hover">
              Syarat &amp; Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-hover">
              Kebijakan Privasi
            </Link>
          </span>
        </label>
        {state.fieldErrors?.agreeToTerms && (
          <p className="text-sm text-danger">{state.fieldErrors.agreeToTerms}</p>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-foreground-muted">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Masuk
        </Link>
      </p>
    </div>
  );
}
