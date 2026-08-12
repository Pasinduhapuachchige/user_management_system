import mongoose from 'mongoose';

// Configuration model for default Death Benefit amount limit
const deathBenefitConfigSchema = new mongoose.Schema({
    defaultAmount: {
        type: Number,
        required: true,
        default: 50000,
        min: 0,
    },
    description: {
        type: String,
        default: 'Standard Death Benefit amount for eligible family members',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    }
}, { timestamps: true });

// Individual Death Benefit issuance record model
const deathBenefitRecordSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    epfNumber: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    relationship: {
        type: String,
        required: true,
        enum: ['Spouse', 'Father', 'Mother', "Spouse's Father", "Spouse's Mother", 'Child', 'Other'],
    },
    deceasedName: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    issuedDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Cancelled'],
        default: 'Paid',
    },
    voucherNumber: {
        type: String,
        trim: true,
        default: '',
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
    createdAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    }
}, { timestamps: true });

export const DeathBenefitConfig = mongoose.model('DeathBenefitConfig', deathBenefitConfigSchema);
export const DeathBenefitRecord = mongoose.model('DeathBenefitRecord', deathBenefitRecordSchema);
