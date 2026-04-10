'use client';

import { Sidebar } from '@/components/sidebar/Sidebar';
import { useSocket } from '@/hooks/useSocket';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useSocket();
  const pathname = usePathname();
  const isChatRoute = pathname.startsWith('/chat/');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--wa-bg-dark)]">
      <div
        className={`h-full border-r border-[#2A3942] ${
          isChatRoute ? 'hidden lg:flex lg:w-[30%] lg:min-w-[360px] lg:max-w-[480px]' : 'flex w-full lg:w-[30%] lg:min-w-[360px] lg:max-w-[480px]'
        }`}
      >
        <Sidebar />
      </div>

      <div className={`h-full flex-1 flex-col ${isChatRoute ? 'flex' : 'hidden lg:flex'}`}>{children}</div>
    </div>
  );
}
