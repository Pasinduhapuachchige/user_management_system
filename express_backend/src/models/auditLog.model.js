import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true
    },
    performedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        email: { type: String, default: 'System/Public' },
        role: { type: String, default: 'unknown' }
    },
    targetResource: {
        type: String,
        default: ''
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'WARNING'],
        default: 'SUCCESS'
    }
}, { timestamps: true });

// Index for fast audit queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ 'performedBy.email': 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
