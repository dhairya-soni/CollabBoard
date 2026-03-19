import React, { createContext, useContext, useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket, type AppSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth';

interface SocketContextValue {
  socket: AppSocket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<AppSocket | null>(null);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      socketRef.current = null;
      return;
    }

    const s = connectSocket(token);
    socketRef.current = s;

    s.on('connect', () => console.log('[socket] connected', s.id));
    s.on('disconnect', (reason) => console.log('[socket] disconnected', reason));
    s.on('connect_error', (err) => console.error('[socket] connect error', err.message));

    return () => {
      // Don't disconnect on re-renders — only on logout (token → null)
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: token ? getSocket() : null }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext).socket;
}
