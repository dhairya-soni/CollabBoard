import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import type { TypingPayload } from '@/types/socket';

const TYPING_TIMEOUT_MS = 2500;

/**
 * Returns who is typing in a specific task's comment box,
 * and helpers to emit typing:start / typing:stop.
 */
export function useTypingIndicator(taskId: string) {
  const socket = useSocket();
  const [typingUsers, setTypingUsers] = useState<TypingPayload[]>([]);
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!socket) return;

    const handleStart = (payload: TypingPayload) => {
      if (payload.taskId !== taskId) return;

      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === payload.userId)) return prev;
        return [...prev, payload];
      });

      // Auto-clear if typing:stop never comes
      const existing = timeouts.current.get(payload.userId);
      if (existing) clearTimeout(existing);
      timeouts.current.set(
        payload.userId,
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
          timeouts.current.delete(payload.userId);
        }, TYPING_TIMEOUT_MS),
      );
    };

    const handleStop = (payload: TypingPayload) => {
      if (payload.taskId !== taskId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
      const t = timeouts.current.get(payload.userId);
      if (t) { clearTimeout(t); timeouts.current.delete(payload.userId); }
    };

    socket.on('typing:start', handleStart);
    socket.on('typing:stop', handleStop);

    return () => {
      socket.off('typing:start', handleStart);
      socket.off('typing:stop', handleStop);
    };
  }, [socket, taskId]);

  const startTyping = useCallback(() => {
    socket?.emit('typing:start', taskId);
  }, [socket, taskId]);

  const stopTyping = useCallback(() => {
    socket?.emit('typing:stop', taskId);
  }, [socket, taskId]);

  return { typingUsers, startTyping, stopTyping };
}
