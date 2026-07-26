// FILE INI HARUS DI: components/auth/ForgotPasswordForm.tsx

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormAlert from '@/components/ui/FormAlert';
import {
  forgotPasswordAction,
  verifyOtpResetAction,
  type ForgotPasswordActionState,
  type VerifyOtpResetActionState,
} from '@/app/(auth)/forgot-password/actions';

const step1Initial: ForgotPasswordActionState = {
  error: null,
  fieldErrors: null,
  success: false,
  email: null,
};

const step2Initial: VerifyOtpResetActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      {pending ? pendingLabel : label}
    </Button>
  );
}

export default function ForgotPasswordForm() {
  const [step1State, step1Action] = useFormState(forgotPasswordAction, step1Initial);
  const [step2State, step2Action] = useFormState(verifyOtpResetAction, step2Initial);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (step1State.success && step1State.email) {
      setEmail(step1State.email);
    }
  }, [step1State]);

  useEffect(() => {
    if (step2State.success) {
      const timeout = setTimeout(() => router.push('/login'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [step2State.success, router]);

  // Sukses akhir: password sudah diganti.
  if (step2State.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-bg">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Password berhasil diubah
        </h1>
        <p className="text-sm text-foreground-muted">
          Anda akan diarahkan ke halaman masuk...
        </p>
      </div>
    );
  }

  // Step 2: kode sudah dikirim, tampilkan form kode + password baru.
  if (step1State.success && email) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Masukkan kode
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Kami sudah mengirim kode 6 digit ke <span className="text-foreground">{email}</span>.
            Masukkan kode itu dan password baru Anda di bawah ini.
          </p>
        </div>

        <form action={step2Action} className="flex flex-col gap-4" noValidate>
          {step2State.error && <FormAlert type="error" message={step2State.error} />}
          <input type="hidden" name="email" value={email} />

          <Input
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            label="Kode 6 Digit"
            placeholder="123456"
            autoComplete="one-time-code"
            error={step2State.fieldErrors?.otp}
            required
          />

          <Input
            name="password"
            type="password"
            label="Password Baru"
            autoComplete="new-password"
            error={step2State.fieldErrors?.password}
            required
          />

          <Input
            name="confirmPassword"
            type="password"
            label="Konfirmasi Password Baru"
            autoComplete="new-password"
            error={step2State.fieldErrors?.confirmPassword}
            required
          />

          <SubmitButton label="Simpan Password Baru" pendingLabel="Memproses..." />
        </form>

        <p className="text-center text-sm text-foreground-muted">
          Tidak menerima kode?{' '}
          <button
            type="button"
            onClick={() => setEmail('')}
            className="font-medium text-primary hover:text-primary-hover"
          >
            Kirim ulang
          </button>
        </p>
      </div>
    );
  }

  // Step 1: form masukkan email.
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Lupa password?
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Masukkan email Anda, kami akan kirim kode 6 digit untuk membuat
          password baru.
        </p>
      </div>

      <form action={step1Action} className="flex flex-col gap-4" noValidate>
        {step1State.error && <FormAlert type="error" message={step1State.error} />}

        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          autoComplete="email"
          error={step1State.fieldErrors?.email}
          required
        />

        <SubmitButton label="Kirim Kode" pendingLabel="Mengirim..." />
      </form>

      <p className="text-center text-sm text-foreground-muted">
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}
