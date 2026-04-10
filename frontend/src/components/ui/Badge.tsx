import { ReactNode } from 'react';

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--wa-green)] px-1.5 text-[11px] font-semibold text-white">
      {children}
    </span>
  );
}
