
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = useRef(null);

    // Initialize Notification Permissions on Mount
    useEffect(() => {
        const requestPermissions = async () => {
            if (Capacitor.isNativePlatform()) {
                const perm = await LocalNotifications.checkPermissions();
                if (perm.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            } else if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        };
        requestPermissions();
    }, []);

    useEffect(() => {
        // Only connect if user is logged in
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        // Prevent duplicate connections
        if (socketRef.current && socketRef.current.connected) return;

        const token = sessionStorage.getItem('ys_token');
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Global Socket Connected:', newSocket.id);
        });

        newSocket.on('new_message', async (data) => {
            // Don't notify if message is from self
            if (data.sender_id === user._id) return;

            // Check if app is in background or user is NOT on chat page
            const isAppInBackground = document.hidden; // Simple check for web
            // For a real check of "Am I on the Chat Page?", we can check the URL.
            // But simpler: just notify. If user is in chat, they will see it anyway (and we can suppress sound/alert if needed).

            const currentPath = window.location.pathname;
            const isInChat = currentPath.includes('/chat');

            // 1. Mobile Push Notification (Local)
            if (Capacitor.isNativePlatform()) {
                const appState = await App.getState();
                if (!appState.isActive || !isInChat) {
                    await LocalNotifications.schedule({
                        notifications: [{
                            title: `New message from ${data.sender_name || 'Someone'}`,
                            body: data.content,
                            id: new Date().getTime(),
                            schedule: { at: new Date(Date.now() + 100) },
                            sound: null,
                            attachments: null,
                            actionTypeId: "",
                            extra: {
                                conversationId: data.conversation_id
                            }
                        }]
                    });
                }
            }
            // 2. Web Notification
            else if (!isInChat || isAppInBackground) {
                if (Notification.permission === 'granted') {
                    new Notification(`Message from ${data.sender_name}`, {
                        body: data.content,
                        // icon: '/logo.png' // Add logo if available
                    });
                }
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
