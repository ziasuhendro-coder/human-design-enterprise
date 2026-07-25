'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormAlert from '@/components/ui/FormAlert';
import { loginAction, type LoginActionState } from '@/app/(auth)/login/actions';

const initialState: LoginActionState = { error: null, fieldErrors: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      {pending ? 'Memproses...' : 'Masuk'}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Selamat datang kembali
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Masuk untuk melanjutkan ke dashboard Anda.
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

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          labelRight={
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary-hover"
            >
              Lupa password?
            </Link>
          }
          autoComplete="current-password"
          error={state.fieldErrors?.password}
          required
        />

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-foreground-muted">
        Belum punya akun?{' '}
        <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
