import { Capacitor } from '@capacitor/core';

// IMPORTANT: On a real phone, "localhost" refers to the phone itself.
// You MUST use your computer's actual IP address for the backend.
const LOCAL_IP = '10.19.28.212';
const BACKEND_PORT = '8000';

export const API_BASE_URL = Capacitor.isNativePlatform()
    ? `http://${LOCAL_IP}:${BACKEND_PORT}`
    : '/api';

export const SOCKET_URL = `http://${LOCAL_IP}:${BACKEND_PORT}`;
