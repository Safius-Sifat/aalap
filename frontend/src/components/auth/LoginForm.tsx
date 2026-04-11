'use client';

import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(6),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginInput) => {
    const { data } = await api.post('/auth/login', values);
    setAuth(data.user, data.accessToken, data.refreshToken);
    router.replace('/chat');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
      <p className="text-sm text-[var(--wa-text-secondary)]">Sign in to continue on Aalap.</p>

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
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-sm text-[var(--wa-text-secondary)]">
        No account?{' '}
        <Link className="text-[var(--wa-green)]" href="/register">
          Create one
        </Link>
      </p>
    </form>
  );
}
