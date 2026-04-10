'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPublicId, setAvatarPublicId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    setName(user.name ?? '');
    setAbout(user.about ?? '');
    setAvatar(user.avatar ?? null);
    setAvatarPublicId(null);
  }, [open, user]);

  const onFileChange = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/upload/avatar', formData, {
      params: { folder: 'avatars' },
    });

    setAvatar(data.url ?? null);
    setAvatarPublicId(data.key ?? null);
  };

  const save = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const payload: {
        name: string;
        about: string;
        avatar?: string;
        avatarPublicId?: string;
      } = {
        name: name.trim(),
        about: about.trim(),
      };

      if (avatar) {
        payload.avatar = avatar;
      }

      if (avatarPublicId) {
        payload.avatarPublicId = avatarPublicId;
      }

      const { data } = await api.patch('/users/me', payload);
      updateUser(data);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2A3942] bg-[#111B21] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#24343D] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Profile</h3>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--wa-text-secondary)] hover:bg-[#1F2C33]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={avatar} name={name || user.name} size={54} />
            <label className="cursor-pointer rounded-md border border-[#2A3942] px-3 py-2 text-xs text-[var(--wa-text-secondary)] hover:bg-[#1F2C33]">
              Upload avatar
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void onFileChange(file);
                  }
                }}
              />
            </label>
          </div>

          <label className="block text-xs text-[var(--wa-text-secondary)]">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2A3942] bg-[#0D171D] px-3 py-2 text-sm text-white outline-none focus:border-[var(--wa-green)]"
            />
          </label>

          <label className="block text-xs text-[var(--wa-text-secondary)]">
            About
            <textarea
              rows={3}
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              className="mt-1 w-full resize-none rounded-lg border border-[#2A3942] bg-[#0D171D] px-3 py-2 text-sm text-white outline-none focus:border-[var(--wa-green)]"
            />
          </label>

          <div className="flex items-center justify-end border-t border-[#24343D] pt-3">
            <button
              onClick={() => void save()}
              disabled={isSaving}
              className="rounded-lg bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-[#0B141A] disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
