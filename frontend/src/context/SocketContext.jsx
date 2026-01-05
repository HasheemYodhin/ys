
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
    const [callState, setCallState] = useState({
        show: false,
        type: null,
        isIncoming: false,
        otherUser: null,
        status: 'idle', // idle, calling, ringing, active, ended
        offer: null
    });
    const socketRef = useRef(null);
    const ringtoneRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3'));

    useEffect(() => {
        ringtoneRef.current.loop = true;
    }, []);

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

        newSocket.on('status_update', (data) => {
            setOnlineUsers(prev => {
                const exists = prev.find(u => u.user_id === data.user_id);
                if (exists) {
                    return prev.map(u => u.user_id === data.user_id ? data : u);
                }
                return [...prev, data];
            });
        });

        newSocket.on('call_incoming', (data) => {
            console.log('Incoming call received in Global Socket:', data);
            // Play ringtone globally
            ringtoneRef.current.play().catch(e => console.error("Ringtone playback failed:", e));

            setCallState({
                show: true,
                type: data.type,
                isIncoming: true,
                otherUser: { id: data.caller_id, name: data.caller_name },
                status: 'ringing',
                offer: data.offer
            });
        });

        newSocket.on('call_ended', () => {
            console.log('Call ended in Global Socket');
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;

            setCallState(prev => ({ ...prev, show: false, status: 'ended' }));
            setTimeout(() => {
                setCallState({ show: false, type: null, isIncoming: false, otherUser: null, status: 'idle', offer: null });
            }, 2000);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Throttled Presence Logic (Global)
    useEffect(() => {
        if (!socket || !user) return;

        let idleTimer;
        let lastStatus = 'online';
        let lastEmitTime = 0;

        const updateStatus = (status) => {
            const now = Date.now();
            // Only emit if status changed OR if it's been more than 60s
            if (status !== lastStatus || (now - lastEmitTime > 60000)) {
                socket.emit('update_status', { status });
                lastStatus = status;
                lastEmitTime = now;
            }
        };

        const resetIdle = () => {
            updateStatus('online');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                updateStatus('idle');
            }, 120000); // 2 minutes
        };

        // Initial set
        updateStatus('online');

        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('keydown', resetIdle);
        window.addEventListener('click', resetIdle);

        return () => {
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            window.removeEventListener('click', resetIdle);
            clearTimeout(idleTimer);
        };
    }, [socket, user]);

    const stopRingtone = () => {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
    };

    const endCall = (targetId) => {
        if (socketRef.current) {
            socketRef.current.emit('end_call', { target_id: targetId });
        }
        stopRingtone();
        setCallState({ show: false, type: null, isIncoming: false, otherUser: null, status: 'idle', offer: null });
    };

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, callState, setCallState, endCall, stopRingtone }}>
            {children}
        </SocketContext.Provider>
    );
};
