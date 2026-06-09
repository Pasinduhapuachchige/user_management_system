import axios from 'axios';

const API_BASE = '/api';

/**
 * Send a notification (Super Admin only)
 */
export const sendNotificationApi = async ({ title, message, targetRole }) => {
    try {
        const res = await axios.post(`${API_BASE}/notifications`, { title, message, targetRole }, { withCredentials: true });
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || 'Failed to send notification.';
        throw new Error(message);
    }
};

/**
 * Get all notifications for the current user's role
 */
export const getNotificationsApi = async () => {
    try {
        const res = await axios.get(`${API_BASE}/notifications`, { withCredentials: true });
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch notifications.';
        throw new Error(message);
    }
};

/**
 * Mark a single notification as read
 */
export const markReadApi = async (id) => {
    try {
        const res = await axios.put(`${API_BASE}/notifications/${id}/read`, {}, { withCredentials: true });
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || 'Failed to mark as read.';
        throw new Error(message);
    }
};

/**
 * Mark all notifications as read
 */
export const markAllReadApi = async () => {
    try {
        const res = await axios.put(`${API_BASE}/notifications/read-all`, {}, { withCredentials: true });
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || 'Failed to mark all as read.';
        throw new Error(message);
    }
};

/**
 * Delete a notification (Super Admin only)
 */
export const deleteNotificationApi = async (id) => {
    try {
        const res = await axios.delete(`${API_BASE}/notifications/${id}`, { withCredentials: true });
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || 'Failed to delete notification.';
        throw new Error(message);
    }
};
