'use client';

import { Sidebar } from '@/components/sidebar/Sidebar';
import { useSocket } from '@/hooks/useSocket';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useSocket();
  const pathname = usePathname();
  const isChatRoot = pathname === '/chat';
  const isChatRoute = pathname.startsWith('/chat/');
  const shouldShowChatShell = isChatRoot || isChatRoute;

  if (!shouldShowChatShell) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--wa-bg-dark)] lg:grid lg:grid-cols-[minmax(360px,480px)_1fr]">
      <div
        className={`h-full border-r border-[#2A3942] ${isChatRoute ? 'hidden lg:block' : 'block w-full'
          }`}
      >
        <Sidebar />
      </div>

      <div className={`h-full min-w-0 flex-col ${isChatRoute ? 'flex' : 'hidden lg:flex'}`}>{children}</div>
    </div>
  );
}
