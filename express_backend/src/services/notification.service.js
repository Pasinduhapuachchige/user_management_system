import Notification from '../models/notification.model.js';

/**
 * Create a new notification
 */
export const createNotification = async ({ title, message, targetRole, createdBy }) => {
    const notification = new Notification({ title, message, targetRole, createdBy });
    return await notification.save();
};

/**
 * Get all notifications visible to a given role.
 * Includes notifications targeted at the role itself OR 'all'.
 */
export const getNotificationsForRole = async (role) => {
    const query = role === 'superadmin'
        ? {}  // superadmin sees all
        : { targetRole: { $in: [role, 'all'] } };

    return await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
};

/**
 * Mark a single notification as read by a user
 */
export const markNotificationRead = async (notifId, userId) => {
    return await Notification.findByIdAndUpdate(
        notifId,
        { $addToSet: { readBy: userId } },
        { new: true }
    );
};

/**
 * Mark all notifications as read for a user (by their role)
 */
export const markAllNotificationsRead = async (userId, role) => {
    const query = role === 'superadmin'
        ? {}
        : { targetRole: { $in: [role, 'all'] } };

    return await Notification.updateMany(
        query,
        { $addToSet: { readBy: userId } }
    );
};

/**
 * Delete a notification (superadmin only)
 */
export const deleteNotification = async (notifId) => {
    return await Notification.findByIdAndDelete(notifId);
};
