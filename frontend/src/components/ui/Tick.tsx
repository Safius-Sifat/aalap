import { CheckCheck, Check } from 'lucide-react';

export function Tick({ read }: { read: boolean }) {
  if (read) {
    return <CheckCheck size={14} className="text-[var(--wa-tick-blue)]" />;
  }
  return <Check size={14} className="text-[var(--wa-text-meta)]" />;
}
