import { format } from 'date-fns';
import { Message } from '@/types';
import { Tick } from '@/components/ui/Tick';
import { ReplyPreview } from './ReplyPreview';
import { MediaMessage } from './MediaMessage';

export function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={`mb-1 flex ${isOwn ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
          isOwn
            ? 'rounded-tr-none bg-[var(--wa-bubble-out-dark)]'
            : 'rounded-tl-none bg-[var(--wa-bubble-in-dark)]'
        }`}
      >
        {message.replyToId ? <ReplyPreview reply={{ content: 'Replied message' }} /> : null}

        {message.isDeleted ? (
          <p className="text-sm italic text-[var(--wa-text-meta)]">This message was deleted</p>
        ) : message.type === 'TEXT' ? (
          <p className="whitespace-pre-wrap break-words text-sm text-white">{message.content}</p>
        ) : (
          <MediaMessage message={message} />
        )}

        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[11px] text-[var(--wa-text-meta)]">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isOwn ? <Tick read={!!message.readReceipts?.length} /> : null}
        </div>
      </div>
    </div>
  );
}
