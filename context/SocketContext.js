import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assume AuthContext is in the same directory

const SocketContext = createContext();

const SOCKET_URL = 'http://localhost:5000'; // Ganti dengan IP lokal Anda jika perlu, tanpa /api

export const SocketProvider = ({ children }) => {
    const { userToken, userRole } = useAuth(); // Get user token and role from AuthContext
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    const initializeSocket = useCallback(() => {
        if (userToken && userRole && !socketRef.current) {
            // Only connect if user is authenticated and socket not already initialized
            console.log('Connecting to Socket.IO...');

            const newSocket = io(SOCKET_URL, {
                auth: { token: userToken }, // Pass token for authentication if needed by Socket.IO server
                query: { role: userRole }
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

            newSocket.on('reconnect_attempt', (attemptNumber) => {
                console.log(`Attempting to reconnect to Socket.IO (attempt #${attemptNumber})...`);
            });

            newSocket.on('reconnect_error', (error) => {
                console.error('Socket.IO reconnection error:', error.message);
            });

            newSocket.on('reconnect_failed', () => {
                console.error('Failed to reconnect to Socket.IO after multiple attempts.');
            });


            socketRef.current = newSocket;
        } else if (!userToken && socketRef.current) {
            // Disconnect if user logs out
            console.log('Disconnecting Socket.IO due to logout.');
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, [userToken, userRole]);

    useEffect(() => {
        initializeSocket();

        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket connection.');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [initializeSocket]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
