import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import type { CursorPosition } from '@/types/socket';

const THROTTLE_MS = 50; // ~20fps

/**
 * Tracks remote cursors in the board and emits local cursor position.
 * Pass a ref to the board container so positions can be computed relative to it.
 */
export function useCursors(containerRef: React.RefObject<HTMLElement | null>) {
  const socket = useSocket();
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const lastEmit = useRef(0);

  // Receive remote cursors
  useEffect(() => {
    if (!socket) return;

    const handleCursor = (payload: CursorPosition) => {
      setCursors((prev) => new Map(prev).set(payload.userId, payload));
    };

    socket.on('cursor:update', handleCursor);
    return () => { socket.off('cursor:update', handleCursor); };
  }, [socket]);

  // Emit local cursor (throttled)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!socket || !containerRef.current) return;
      const now = Date.now();
      if (now - lastEmit.current < THROTTLE_MS) return;
      lastEmit.current = now;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      socket.emit('cursor:move', { x, y });
    },
    [socket, containerRef],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    return () => { el.removeEventListener('mousemove', handleMouseMove); };
  }, [handleMouseMove, containerRef]);

  return Array.from(cursors.values());
}
