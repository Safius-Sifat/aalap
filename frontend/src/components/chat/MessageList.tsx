'use client';

import { useAuthStore } from '@/stores/authStore';
import { Message } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';

type Props = {
    messages: Message[];
    hasMore: boolean;
    onLoadOlder: () => Promise<unknown> | void;
    loadingOlder: boolean;
    onReply: (message: Message) => void;
};

export function MessageList({
    messages,
    hasMore,
    onLoadOlder,
    loadingOlder,
    onReply,
}: Props) {
    const user = useAuthStore((state) => state.user);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const prevLengthRef = useRef(0);
    const pendingPrependRef = useRef<{ prevHeight: number; prevTop: number } | null>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);

    if (!messages.length) {
        return (
            <div className="flex flex-1 items-center justify-center px-4 text-sm text-[var(--wa-text-secondary)]">
                No messages yet. Say hi!
            </div>
        );
    }

    const handleLoadOlder = async () => {
        if (scrollRef.current) {
            pendingPrependRef.current = {
                prevHeight: scrollRef.current.scrollHeight,
                prevTop: scrollRef.current.scrollTop,
            };
        }

        await onLoadOlder();
    };

    const updateNearBottom = () => {
        if (!scrollRef.current) {
            return;
        }

        const distanceFromBottom =
            scrollRef.current.scrollHeight - (scrollRef.current.scrollTop + scrollRef.current.clientHeight);
        setIsNearBottom(distanceFromBottom < 120);
    };

    useEffect(() => {
        if (!scrollRef.current) {
            return;
        }

        const currentLength = messages.length;

        if (prevLengthRef.current === 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            prevLengthRef.current = currentLength;
            return;
        }

        if (pendingPrependRef.current) {
            const delta = scrollRef.current.scrollHeight - pendingPrependRef.current.prevHeight;
            scrollRef.current.scrollTop = pendingPrependRef.current.prevTop + delta;
            pendingPrependRef.current = null;
            prevLengthRef.current = currentLength;
            return;
        }

        if (isNearBottom) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }

        prevLengthRef.current = currentLength;
    }, [messages, isNearBottom]);

    return (
        <div ref={scrollRef} onScroll={updateNearBottom} className="flex-1 overflow-y-auto py-4">
            <div className="mb-3 flex justify-center">
                {hasMore ? (
                    <button
                        onClick={() => void handleLoadOlder()}
                        disabled={loadingOlder}
                        className="rounded-full border border-[#2A3942] bg-[#111B21] px-3 py-1 text-xs text-[var(--wa-text-secondary)] disabled:opacity-70"
                    >
                        {loadingOlder ? 'Loading older...' : 'Load older messages'}
                    </button>
                ) : (
                    <span className="text-xs text-[var(--wa-text-meta)]">Beginning of conversation</span>
                )}
            </div>

            {messages.map((message, index) => {
                const current = new Date(message.createdAt);
                const prev = messages[index - 1] ? new Date(messages[index - 1].createdAt) : null;

                const showDateSeparator = !prev || current.toDateString() !== prev.toDateString();

                let dateLabel = format(current, 'dd MMM yyyy');
                if (isToday(current)) {
                    dateLabel = 'Today';
                } else if (isYesterday(current)) {
                    dateLabel = 'Yesterday';
                }

                return (
                    <div key={message.id}>
                        {showDateSeparator ? (
                            <div className="my-3 flex justify-center">
                                <span className="rounded-full bg-[#1D2D35] px-2.5 py-1 text-[11px] text-[var(--wa-text-meta)]">
                                    {dateLabel}
                                </span>
                            </div>
                        ) : null}
                        <MessageBubble
                            message={message}
                            isOwn={message.senderId === user?.id}
                            onReply={onReply}
                        />
                    </div>
                );
            })}
        </div>
    );
}
