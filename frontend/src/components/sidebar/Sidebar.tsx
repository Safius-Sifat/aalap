'use client';

import { useEffect, useState } from 'react';
import { LogOut, MessageCirclePlus, UserRoundPen, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { ChatList } from './ChatList';
import { useChats } from '@/hooks/useChats';
import { useChatStore } from '@/stores/chatStore';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { NewChatModal } from './NewChatModal';
import { NewGroupModal } from './NewGroupModal';
import { UserSearchResults } from './UserSearchResults';
import { ProfileModal } from '@/components/modals/ProfileModal';

export function Sidebar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const setChats = useChatStore((state) => state.setChats);
  const { data: chats, isLoading } = useChats(!!user);

  useEffect(() => {
    if (chats) {
      setChats(chats);
    }
  }, [chats, setChats]);

  return (
    <aside className="flex h-full flex-col bg-[var(--wa-panel-dark)]">
      <div className="flex items-center justify-between border-b border-[#2A3942] bg-[#202C33] px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name} size={40} />
          <div>
            <p className="text-sm font-semibold text-white">{user?.name ?? 'Aalap User'}</p>
            <p className="text-xs text-[var(--wa-text-secondary)]">{user?.phone ?? ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowProfile(true)}
            className="rounded-md p-2 text-[var(--wa-icon)] hover:bg-[#2A3942]"
            title="Profile"
          >
            <UserRoundPen size={18} />
          </button>
          <button
            onClick={() => setShowNewChat(true)}
            className="rounded-md p-2 text-[var(--wa-icon)] hover:bg-[#2A3942]"
            title="New chat"
          >
            <MessageCirclePlus size={18} />
          </button>
          <button
            onClick={() => setShowNewGroup(true)}
            className="rounded-md p-2 text-[var(--wa-icon)] hover:bg-[#2A3942]"
            title="New group"
          >
            <UsersRound size={18} />
          </button>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="rounded-md p-2 text-[var(--wa-icon)] hover:bg-[#2A3942]"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="border-b border-[#1F2C33] p-3">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-sm text-[var(--wa-text-secondary)]">Loading chats...</div>
        ) : searchQuery.trim() ? (
          <UserSearchResults query={searchQuery} />
        ) : (
          <ChatList query="" />
        )}
      </div>

      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} />
      <NewGroupModal open={showNewGroup} onClose={() => setShowNewGroup(false)} />
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </aside>
  );
}
