import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import type { PresenceUser } from '@/types/socket';

/**
 * Joins a project room on mount, leaves on unmount.
 * Returns list of currently online users in that room.
 */
export function usePresence(projectId: string | undefined) {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('room:join', projectId);

    socket.on('presence:update', setOnlineUsers);

    return () => {
      socket.emit('room:leave', projectId);
      socket.off('presence:update', setOnlineUsers);
      setOnlineUsers([]);
    };
  }, [socket, projectId]);

  return onlineUsers;
}
