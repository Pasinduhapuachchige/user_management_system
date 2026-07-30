import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    epfNo: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['admin', 'hr_officer', 'superadmin', 'employee', 'hr_manager'],
        default: 'hr_officer'
    },
    passwordUpdatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

adminSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.passwordUpdatedAt = new Date();
    }
    next();
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
