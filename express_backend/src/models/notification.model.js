import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        // 'employee' | 'admin' | 'all'
        targetRole: {
            type: String,
            enum: ['employee', 'admin', 'all'],
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        // Array of user IDs who have read this notification
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
            }
        ],
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
