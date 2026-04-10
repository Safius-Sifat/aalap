import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B141A] px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(37,211,102,0.18),transparent_40%),radial-gradient(circle_at_15%_85%,rgba(83,189,235,0.14),transparent_45%)]" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#22313A] bg-[#111B21]/90 p-6 shadow-2xl backdrop-blur-sm">
        <RegisterForm />
      </div>
    </main>
  );
}
