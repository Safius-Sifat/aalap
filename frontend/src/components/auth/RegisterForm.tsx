'use client';

import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .min(8, 'Phone number must be at least 8 digits')
    .regex(/^\+?[0-9]{8,15}$/, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterInput = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setSubmitError(null);
    try {
      const { data } = await api.post('/auth/register', values);
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/chat');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string | string[] } | undefined)?.message ??
          'Unable to create account. Please try again.';
        setSubmitError(Array.isArray(message) ? message.join(', ') : message);
        return;
      }

      setSubmitError('Unable to create account. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-3xl font-semibold text-white">Create account</h1>
      <p className="text-sm text-[var(--wa-text-secondary)]">Set up your Aalap profile.</p>

      <label className="text-sm text-[var(--wa-text-secondary)]">
        Name
        <input
          {...register('name')}
          className="mt-1 w-full rounded-xl border border-[#2A3942] bg-[#111B21] px-4 py-3 text-white outline-none focus:border-[var(--wa-green)]"
        />
        {errors.name ? <span className="mt-1 block text-xs text-red-400">{errors.name.message}</span> : null}
      </label>

      <label className="text-sm text-[var(--wa-text-secondary)]">
        Phone number
        <input
          {...register('phone')}
          placeholder="+8801XXXXXXXXX"
          className="mt-1 w-full rounded-xl border border-[#2A3942] bg-[#111B21] px-4 py-3 text-white outline-none focus:border-[var(--wa-green)]"
        />
        {errors.phone ? <span className="mt-1 block text-xs text-red-400">{errors.phone.message}</span> : null}
      </label>

      <label className="text-sm text-[var(--wa-text-secondary)]">
        Password
        <input
          {...register('password')}
          type="password"
          className="mt-1 w-full rounded-xl border border-[#2A3942] bg-[#111B21] px-4 py-3 text-white outline-none focus:border-[var(--wa-green)]"
        />
        {errors.password ? <span className="mt-1 block text-xs text-red-400">{errors.password.message}</span> : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-xl bg-[var(--wa-green)] px-4 py-3 font-semibold text-[#0B141A] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Creating...' : 'Create account'}
      </button>

      {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

      <p className="text-sm text-[var(--wa-text-secondary)]">
        Already have an account?{' '}
        <Link className="text-[var(--wa-green)]" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
