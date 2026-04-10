'use client';

import { useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile, Paperclip, SendHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { SocketEvents } from '@/types';
import { ReplyPreview } from './ReplyPreview';

type Props = {
  chatId: string;
};

export function MessageInput({ chatId }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const replyTo = useChatStore((state) => state.replyTo);
  const clearReplyTo = useChatStore((state) => state.clearReplyTo);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const socket = accessToken ? getSocket(accessToken) : null;

  const emitTyping = () => {
    socket?.emit(SocketEvents.TYPING_START, { chatId });
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      socket?.emit(SocketEvents.TYPING_STOP, { chatId });
    }, 1200);
  };

  const sendTextMessage = () => {
    if (!text.trim()) {
      return;
    }

    socket?.emit(SocketEvents.SEND_MESSAGE, {
      chatId,
      content: text.trim(),
      type: 'TEXT',
      replyToId: replyTo?.id,
    });

    setText('');
    setShowEmoji(false);
    clearReplyTo();
  };

  const uploadAndSendFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/upload/media', formData);

    const type = file.type.startsWith('image/')
      ? 'IMAGE'
      : file.type.startsWith('video/')
        ? 'VIDEO'
        : 'DOCUMENT';

    socket?.emit(SocketEvents.SEND_MESSAGE, {
      chatId,
      type,
      mediaUrl: data.url,
      fileName: file.name,
    });
  };

  return (
    <div className="relative border-t border-[#2A3942] bg-[#202C33] px-3 py-2">
      {replyTo ? (
        <ReplyPreview
          reply={{
            content: replyTo.content ?? 'Media message',
            senderName: replyTo.sender?.name,
          }}
          onClose={clearReplyTo}
        />
      ) : null}

      <div className="flex items-end gap-2">
        <button
          className="rounded-full p-2 text-[var(--wa-icon)] hover:bg-[#2A3942]"
          onClick={() => setShowEmoji((prev) => !prev)}
        >
          <Smile size={20} />
        </button>

        <button
          className="rounded-full p-2 text-[var(--wa-icon)] hover:bg-[#2A3942]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={20} />
        </button>

        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadAndSendFile(file);
            }
          }}
        />

        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            emitTyping();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              sendTextMessage();
            }
          }}
          placeholder="Type a message"
          rows={1}
          className="max-h-24 min-h-10 flex-1 resize-none rounded-xl bg-[#111B21] px-4 py-2 text-sm text-white outline-none"
        />

        <button
          className="rounded-full bg-[var(--wa-green)] p-2 text-[#0B141A]"
          onClick={sendTextMessage}
          disabled={!text.trim()}
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      {showEmoji ? (
        <div className="absolute bottom-14 left-2 z-20">
          <EmojiPicker onEmojiClick={(emoji) => setText((value) => `${value}${emoji.emoji}`)} />
        </div>
      ) : null}
    </div>
  );
}
