import { Message } from '@/types';

export function MediaMessage({ message }: { message: Message }) {
  if (message.type === 'IMAGE' && message.mediaUrl) {
    return <img src={message.mediaUrl} alt="image message" className="max-h-72 max-w-full rounded-md object-cover" />;
  }

  if (message.type === 'VIDEO' && message.mediaUrl) {
    return <video controls src={message.mediaUrl} className="max-h-72 max-w-full rounded-md" />;
  }

  if (message.mediaUrl) {
    return (
      <a
        href={message.mediaUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-[var(--wa-green)] underline"
      >
        {message.fileName ?? 'Open attachment'}
      </a>
    );
  }

  return <span className="text-sm text-[var(--wa-text-secondary)]">Unsupported media</span>;
}
