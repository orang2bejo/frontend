import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assume AuthContext is in the same directory

const SocketContext = createContext();

const SOCKET_URL = 'http://localhost:5000'; // Ganti dengan IP lokal Anda jika perlu, tanpa /api

export const SocketProvider = ({ children }) => {
  const { userToken, userRole } = useAuth(); // Get user token and role from AuthContext
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userToken && userRole && !socketRef.current) {
      // Only connect if user is authenticated and socket not already initialized
      console.log('Connecting to Socket.IO...');
      const newSocket = io(SOCKET_URL, {
        auth: { token: userToken }, // Pass token for authentication if needed by Socket.IO server
        query: { role: userRole } // Pass role if needed by Socket.IO server for initial connection
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO connected!');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.IO disconnected.');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
      });

      socketRef.current = newSocket;
    } else if (!userToken && socketRef.current) {
      // Disconnect if user logs out
      console.log('Disconnecting Socket.IO due to logout.');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection.');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userToken, userRole]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
