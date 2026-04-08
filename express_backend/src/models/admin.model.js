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
        enum: ['admin', 'superadmin', 'employee', 'hr_manager'],
        default: 'admin'
    }
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
