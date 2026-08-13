import { DeathBenefitConfig, DeathBenefitRecord } from '../models/deathBenefit.model.js';
import Employee from '../models/employee.model.js';

// GET Death Benefit Configuration
export const getConfigController = async (req, res) => {
    try {
        let config = await DeathBenefitConfig.findOne({});
        if (!config) {
            config = await DeathBenefitConfig.create({
                defaultAmount: 50000,
                description: 'Standard Death Benefit amount for eligible family members',
            });
        }
        res.status(200).json({ success: true, data: config });
    } catch (err) {
        console.error('Get Death Benefit Config Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE Death Benefit Configuration
export const updateConfigController = async (req, res) => {
    try {
        const { defaultAmount, description } = req.body;
        if (defaultAmount === undefined || defaultAmount < 0) {
            return res.status(400).json({ success: false, message: 'Valid default amount is required' });
        }

        let config = await DeathBenefitConfig.findOne({});
        if (!config) {
            config = new DeathBenefitConfig({ defaultAmount, description });
        } else {
            config.defaultAmount = defaultAmount;
            if (description !== undefined) config.description = description;
            config.updatedBy = req.user?._id;
        }

        await config.save();
        res.status(200).json({ success: true, message: 'Death benefit configuration updated', data: config });
    } catch (err) {
        console.error('Update Death Benefit Config Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// CREATE Issued Death Benefit Record
export const createDeathBenefitController = async (req, res) => {
    try {
        const { epfNumber, relationship, deceasedName, amount, issuedDate, status, voucherNumber, notes } = req.body;

        if (!epfNumber || !relationship || !deceasedName || amount === undefined) {
            return res.status(400).json({ success: false, message: 'EPF number, relationship, deceased name, and amount are required' });
        }

        const employee = await Employee.findOne({ epfNumber: String(epfNumber).trim() });
        if (!employee) {
            return res.status(404).json({ success: false, message: `Employee with EPF number ${epfNumber} not found` });
        }

        const record = await DeathBenefitRecord.create({
            employee: employee._id,
            epfNumber: employee.epfNumber,
            relationship,
            deceasedName,
            amount: Number(amount),
            issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
            status: status || 'Paid',
            voucherNumber: voucherNumber || '',
            notes: notes || '',
            createdAdmin: req.user?._id,
        });

        await record.populate('employee', 'name epfNumber department email contactNumber profilePicture');
        await record.populate('employee.department', 'name');

        res.status(201).json({ success: true, message: 'Death benefit recorded successfully', data: record });
    } catch (err) {
        console.error('Create Death Benefit Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET Issued Death Benefit Records
export const getDeathBenefitsController = async (req, res) => {
    try {
        const { epfNumber, employee, search, status, relationship } = req.query;
        const query = {};

        if (epfNumber) {
            query.epfNumber = String(epfNumber).trim();
        }

        if (employee) {
            query.employee = employee;
        }

        if (status) {
            query.status = status;
        }

        if (relationship) {
            query.relationship = relationship;
        }

        let records = await DeathBenefitRecord.find(query)
            .populate({
                path: 'employee',
                select: 'name epfNumber department email contactNumber profilePicture',
                populate: { path: 'department', select: 'name' }
            })
            .sort({ issuedDate: -1, createdAt: -1 });

        // Optional text search in employee name or deceasedName if search query provided
        if (search) {
            const term = search.toLowerCase().trim();
            records = records.filter(rec => {
                const empName = rec.employee?.name?.toLowerCase() || '';
                const epf = rec.epfNumber?.toLowerCase() || '';
                const decName = rec.deceasedName?.toLowerCase() || '';
                const voucher = rec.voucherNumber?.toLowerCase() || '';
                return empName.includes(term) || epf.includes(term) || decName.includes(term) || voucher.includes(term);
            });
        }

        res.status(200).json({ success: true, data: records });
    } catch (err) {
        console.error('Get Death Benefits Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE Issued Death Benefit Record
export const updateDeathBenefitController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.issuedDate) {
            updateData.issuedDate = new Date(updateData.issuedDate);
        }

        const record = await DeathBenefitRecord.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate({
                path: 'employee',
                select: 'name epfNumber department email contactNumber profilePicture',
                populate: { path: 'department', select: 'name' }
            });

        if (!record) {
            return res.status(404).json({ success: false, message: 'Death benefit record not found' });
        }

        res.status(200).json({ success: true, message: 'Death benefit record updated', data: record });
    } catch (err) {
        console.error('Update Death Benefit Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE Issued Death Benefit Record
export const deleteDeathBenefitController = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await DeathBenefitRecord.findByIdAndDelete(id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Death benefit record not found' });
        }

        res.status(200).json({ success: true, message: 'Death benefit record deleted' });
    } catch (err) {
        console.error('Delete Death Benefit Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
