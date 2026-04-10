type Props = {
  reply: {
    content?: string | null;
    senderName?: string;
  };
  title?: string;
  onClose?: () => void;
};

export function ReplyPreview({ reply, title = 'Replying', onClose }: Props) {
  return (
    <div className="mb-2 rounded-md border-l-4 border-[var(--wa-green)] bg-[#111B21] p-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[var(--wa-green)]">{title}</p>
          {reply.senderName ? (
            <p className="text-[10px] text-[var(--wa-text-meta)]">{reply.senderName}</p>
          ) : null}
          <p className="line-clamp-1 text-xs text-[var(--wa-text-secondary)]">{reply.content ?? 'Media message'}</p>
        </div>
        {onClose ? (
          <button onClick={onClose} className="text-xs text-[var(--wa-text-secondary)]">
            close
          </button>
        ) : null}
      </div>
    </div>
  );
}
