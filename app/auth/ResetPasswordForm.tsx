// ============================================================
// AKSI: BUAT FILE BARU
// PATH   : components/auth/ResetPasswordForm.tsx
// ============================================================

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormAlert from '@/components/ui/FormAlert';
import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from '@/app/(auth)/reset-password/actions';

const initialState: ResetPasswordActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      {pending ? 'Menyimpan...' : 'Simpan Password Baru'}
    </Button>
  );
}

export default function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(() => router.push('/login'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.success, router]);

  if (state.success) {
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Buat password baru
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Password baru Anda harus berbeda dari password sebelumnya.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {state.error && <FormAlert type="error" message={state.error} />}

        <Input
          name="password"
          type="password"
          label="Password Baru"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state.fieldErrors?.password}
          required
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Konfirmasi Password Baru"
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
          required
        />

        <SubmitButton />
      </form>
    </div>
  );
}

