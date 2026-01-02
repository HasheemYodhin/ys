import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    const fetchUser = async (token) => {
        try {
            const response = await fetch('/api/auth/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser({
                    ...userData,
                    name: userData.full_name || userData.name,
                });
            } else {
                logout();
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        const token = sessionStorage.getItem('ys_token');
        if (!token || user?.role !== 'Employer') return;

        try {
            const response = await fetch('/api/auth/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const updateProfile = async (profileData) => {
        const token = sessionStorage.getItem('ys_token');
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to update profile');
        }

        const updatedUser = await response.json();
        setUser({
            ...updatedUser,
            name: updatedUser.full_name || updatedUser.name,
        });
        return updatedUser;
    };

    useEffect(() => {
        const token = sessionStorage.getItem('ys_token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'Employer') {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Pulse every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch('/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        // Clear old token first
        sessionStorage.removeItem('ys_token');
        sessionStorage.setItem('ys_token', data.access_token);
        // Force state update instantly
        await fetchUser(data.access_token);
        return true;
    };

    const signup = async (userData) => {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Signup failed');
        }
        return await response.json();
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('ys_token');
        // Redirect logic is handled by components using 'user' state
    };

    const requestPasswordReset = async () => {
        const token = sessionStorage.getItem('ys_token');
        const response = await fetch('/api/auth/request-password-reset', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to request reset');
        const data = await response.json();
        setUser(prev => ({ ...prev, password_reset_requested: true }));
        return data;
    };

    const toggle2FA = async () => {
        const token = sessionStorage.getItem('ys_token');
        const response = await fetch('/api/auth/toggle-2fa', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to toggle 2FA');
        const data = await response.json();
        setUser(prev => ({ ...prev, two_factor_enabled: data.two_factor_enabled }));
        return data;
    };

    const resolveNotification = async (userId) => {
        const token = sessionStorage.getItem('ys_token');
        const response = await fetch(`/api/auth/notifications/${userId}/resolve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to resolve notification');
        await fetchNotifications();
        return await response.json();
    };

    return (
        <AuthContext.Provider value={{
            user, login, signup, logout, updateProfile,
            requestPasswordReset, toggle2FA,
            notifications, fetchNotifications, resolveNotification, loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
