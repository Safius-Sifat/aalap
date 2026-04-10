import { format } from 'date-fns';
import { Message } from '@/types';
import { Tick } from '@/components/ui/Tick';
import { ReplyPreview } from './ReplyPreview';
import { MediaMessage } from './MediaMessage';
import { CornerUpLeft } from 'lucide-react';

function getReplySnippet(message: Message) {
  if (!message.replyTo) {
    return { content: 'Replied message', senderName: undefined };
  }

  if (message.replyTo.isDeleted) {
    return {
      content: 'This message was deleted',
      senderName: message.replyTo.sender?.name,
    };
  }

  if (message.replyTo.type && message.replyTo.type !== 'TEXT') {
    const mediaLabel = message.replyTo.type === 'IMAGE'
      ? 'Photo'
      : message.replyTo.type === 'VIDEO'
        ? 'Video'
        : 'Media message';

    return {
      content: message.replyTo.content ?? mediaLabel,
      senderName: message.replyTo.sender?.name,
    };
  }

  return {
    content: message.replyTo.content ?? 'Replied message',
    senderName: message.replyTo.sender?.name,
  };
}

export function MessageBubble({
  message,
  isOwn,
  onReply,
}: {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
}) {
  const replySnippet = getReplySnippet(message);

  return (
    <div className={`mb-1 flex ${isOwn ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
          isOwn
            ? 'rounded-tr-none bg-[var(--wa-bubble-out-dark)]'
            : 'rounded-tl-none bg-[var(--wa-bubble-in-dark)]'
        }`}
      >
        {message.replyToId ? (
          <ReplyPreview
            reply={{
              content: replySnippet.content,
              senderName: replySnippet.senderName,
            }}
            title="Reply"
          />
        ) : null}

        {message.isDeleted ? (
          <p className="text-sm italic text-[var(--wa-text-meta)]">This message was deleted</p>
        ) : message.type === 'TEXT' ? (
          <p className="whitespace-pre-wrap break-words text-sm text-white">{message.content}</p>
        ) : (
          <MediaMessage message={message} />
        )}

        <div className="mt-1 flex items-center justify-end gap-1">
          <button
            onClick={() => onReply?.(message)}
            className="rounded p-0.5 text-[var(--wa-text-meta)] hover:bg-[#2A3942]"
            title="Reply"
          >
            <CornerUpLeft size={13} />
          </button>
          <span className="text-[11px] text-[var(--wa-text-meta)]">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isOwn ? <Tick read={!!message.readReceipts?.length} /> : null}
        </div>
      </div>
    </div>
  );
}
