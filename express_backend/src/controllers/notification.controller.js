import {
    createNotification,
    getNotificationsForRole,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} from '../services/notification.service.js';

/**
 * POST /notifications
 * Super Admin only – create & send a notification
 */
export const sendNotificationController = async (req, res) => {
    try {
        const { title, message, targetRole } = req.body;

        if (!title || !message || !targetRole) {
            return res.status(400).json({
                success: false,
                message: 'title, message and targetRole are required.',
            });
        }

        if (!['employee', 'admin', 'all'].includes(targetRole)) {
            return res.status(400).json({
                success: false,
                message: "targetRole must be 'employee', 'admin', or 'all'.",
            });
        }

        const notification = await createNotification({
            title,
            message,
            targetRole,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: 'Notification sent successfully.',
            data: notification,
        });
    } catch (err) {
        console.error('Error sending notification:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to send notification.',
        });
    }
};

/**
 * GET /notifications
 * Any authenticated user – get notifications for their role
 */
export const getNotificationsController = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user._id;

        const notifications = await getNotificationsForRole(role);

        // Attach an `isRead` boolean for each notification for this user
        const data = notifications.map((n) => ({
            ...n,
            isRead: n.readBy.some((id) => id.toString() === userId.toString()),
        }));

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications.',
        });
    }
};

/**
 * PUT /notifications/:id/read
 * Mark a single notification as read
 */
export const markReadController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        await markNotificationRead(id, userId);

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read.',
        });
    } catch (err) {
        console.error('Error marking notification read:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read.',
        });
    }
};

/**
 * PUT /notifications/read-all
 * Mark all notifications as read for the current user
 */
export const markAllReadController = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        await markAllNotificationsRead(userId, role);

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read.',
        });
    } catch (err) {
        console.error('Error marking all notifications read:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read.',
        });
    }
};

/**
 * DELETE /notifications/:id
 * Super Admin only – delete a notification
 */
export const deleteNotificationController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteNotification(id);

        return res.status(200).json({
            success: true,
            message: 'Notification deleted.',
        });
    } catch (err) {
        console.error('Error deleting notification:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete notification.',
        });
    }
};
