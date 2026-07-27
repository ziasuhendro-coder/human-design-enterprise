// ============================================================
// AKSI: GANTI ISI FILE YANG SUDAH ADA
// PATH   : components/auth/ForgotPasswordForm.tsx
// ============================================================

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormAlert from '@/components/ui/FormAlert';
import {
  forgotPasswordAction,
  type ForgotPasswordActionState,
} from '@/app/(auth)/forgot-password/actions';

const initialState: ForgotPasswordActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      {pending ? 'Mengirim...' : 'Kirim Link Reset'}
    </Button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Cek email Anda
        </h1>
        <p className="text-sm text-foreground-muted">
          Jika email tersebut terdaftar, kami sudah mengirim link reset
          password. Klik link tersebut untuk membuat password baru.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary hover:text-primary-hover">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Lupa password?
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Masukkan email Anda, kami akan kirim link untuk membuat password
          baru.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {state.error && <FormAlert type="error" message={state.error} />}

        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          autoComplete="email"
          error={state.fieldErrors?.email}
          required
        />

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-foreground-muted">
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}
