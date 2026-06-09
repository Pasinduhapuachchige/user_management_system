import EmployeeMedical from "../models/employeeMedical.model.js";
import Medical from "../models/medical.model.js";

export const updateMaxMedical = async (data) => {
    try {
        // Handle both old format (just maxMedical) and new format (maxMedical with ranges)
        const updateData = typeof data === 'number' ? { maxMedical: data } : data;

        const updatedMedical = await Medical.findOneAndUpdate(
            {},
            updateData,
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );
        return updatedMedical;
    } catch (err) {
        console.error('Service error updating Medical config:', err);
        throw err;
    }
};

export const getMaxMedical = async () => {
    try {
        const medical = await Medical.findOne({});
        return medical;
    } catch (err) {
        console.error('Service error fetching Medical config:', err);
        throw err;
    }
};

// Additional helper functions for range management
export const getMedicalRanges = async () => {
    try {
        const medical = await Medical.findOne({});
        return medical ? medical.ranges || [] : [];
    } catch (err) {
        console.error('Service error fetching Medical ranges:', err);
        throw err;
    }
};

export const validateEpfNumberAgainstRanges = async (epfNumber) => {
    try {
        const medicalConfig = await Medical.findOne({});
        if (!medicalConfig) {
            return { valid: false, message: 'Medical configuration not found' };
        }

        // Check against system maximum
        if (epfNumber > medicalConfig.maxMedical) {
            return {
                valid: false,
                message: `EPF number ${epfNumber} exceeds system maximum ${medicalConfig.maxMedical}`
            };
        }

        // If ranges are configured, find which range this EPF number belongs to
        if (medicalConfig.ranges && medicalConfig.ranges.length > 0) {
            const sortedRanges = medicalConfig.ranges.sort((a, b) => a.maxValue - b.maxValue);

            for (const range of sortedRanges) {
                if (epfNumber <= range.maxValue) {
                    return {
                        valid: true,
                        range: range.name,
                        message: `EPF number ${epfNumber} belongs to ${range.name} range`
                    };
                }
            }

            // If no range found, it means it's above all ranges but below system max
            return {
                valid: true,
                range: 'Unassigned',
                message: `EPF number ${epfNumber} is above all configured ranges but within system limit`
            };
        }

        return {
            valid: true,
            message: `EPF number ${epfNumber} is valid (within system maximum ${medicalConfig.maxMedical})`
        };
    } catch (err) {
        console.error('Service error validating EPF number:', err);
        throw err;
    }
};

export const getEmployeeMedicals = async (query = {}) => {
    try {
        const filter = {};

        if (query.user) {
            filter.user = query.user;
        }

        if (query.year) {
            const start = new Date(`${query.year}-01-01T00:00:00.000Z`);
            const end = new Date(`${parseInt(query.year) + 1}-01-01T00:00:00.000Z`);
            filter.year = { $gte: start, $lt: end };
        }

        const medicalRecords = await EmployeeMedical.find(filter)
            .populate("user", "name email epfNumber")
            .sort({ year: 1 });

        const enrichedRecords = medicalRecords.map(record => {
            const regularExpenseTotal = (record.regularExpenses || []).reduce(
                (sum, exp) => sum + (exp.amount || 0),
                0
            );

            const rangeExpenses = (record.rangeExpenses || []).map(range => {
                const rangeExpenseTotal = (range.expenses || []).reduce(
                    (sum, exp) => sum + (exp.amount || 0),
                    0
                );
                return {
                    ...range.toObject(),
                    expense: rangeExpenseTotal
                };
            });

            const rangeExpenseTotal = rangeExpenses.reduce(
                (sum, r) => sum + (r.expense || 0),
                0
            );

            return {
                ...record.toObject(),
                expense: regularExpenseTotal + rangeExpenseTotal,
                rangeExpenses,
                regularExpenses: {
                    expense: regularExpenseTotal,
                    items: record.regularExpenses
                }
            };
        });

        return {
            success: true,
            data: enrichedRecords
        };

    } catch (err) {
        console.error("Error fetching Employee Medical records:", err);
        return {
            success: false,
            message: "Failed to fetch records.",
            error: err.message || err
        };
    }
};

export const createOrUpdateEmployeeMedical = async (payload) => {
    const {
        user,
        year,
        rangeExpenses = [],
        regularExpenses = [],
        method = "update" // default to replacing behavior
    } = payload;

    const start = new Date(Date.UTC(new Date(year).getFullYear(), 0, 1));
    const end = new Date(Date.UTC(new Date(year).getFullYear() + 1, 0, 1));

    let record = await EmployeeMedical.findOne({ user, year: { $gte: start, $lt: end } });

    if (!record) {
        record = new EmployeeMedical({
            user,
            year: start,
            rangeExpenses,
            regularExpenses
        });
    } else {
        if (method === "add") {
            // Append new regular expenses
            record.regularExpenses.push(...regularExpenses);

            // Merge range expenses
            for (const newRange of rangeExpenses) {
                const existingRange = record.rangeExpenses.find(r => r.name === newRange.name);

                if (existingRange) {
                    existingRange.expenses.push(...newRange.expenses);
                } else {
                    record.rangeExpenses.push(newRange);
                }
            }

        } else {
            // Replace regular expenses
            record.regularExpenses = [...regularExpenses];

            // Replace range expenses
            for (const newRange of rangeExpenses) {
                const existingRange = record.rangeExpenses.find(r => r.name === newRange.name);

                if (existingRange) {
                    existingRange.expenses = [...newRange.expenses];
                } else {
                    record.rangeExpenses.push(newRange);
                }
            }

            // Remove any old range not in new list
            const newRangeNames = rangeExpenses.map(r => r.name);
            record.rangeExpenses = record.rangeExpenses.filter(r => newRangeNames.includes(r.name));
        }
    }

    // Calculate total expense
    const totalRegular = record.regularExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalRange = record.rangeExpenses.reduce(
        (sum, r) => sum + r.expenses.reduce((s, e) => s + (e.amount || 0), 0),
        0
    );
    const totalExpense = totalRegular + totalRange;

    // Fetch the maximum limit from the database configuration (defaulting to 15000 if not configured)
    const medicalConfig = await Medical.findOne({});
    const maxLimit = medicalConfig?.maxMedical || 15000;

    if (totalExpense > maxLimit) {
        throw new Error(`Total expense exceeds ${maxLimit} limit.`);
    }

    record.expense = totalExpense;

    await record.save();
    return record;
};

export const deleteEmployeeMedicalExpense = async ({ medicalId, type, createdAt, rangeName }) => {
    try {
        const medicalRecord = await EmployeeMedical.findById(medicalId);
        if (!medicalRecord) {
            throw new Error("Medical record not found");
        }

        if (type === "regular") {
            medicalRecord.regularExpenses = medicalRecord.regularExpenses.filter(
                exp => exp.createdAt.toISOString() !== createdAt
            );
        } else if (type === "range") {
            const range = medicalRecord.rangeExpenses.find(r => r.name === rangeName);
            if (!range) throw new Error("Range not found");

            range.expenses = range.expenses.filter(
                exp => exp.createdAt.toISOString() !== createdAt
            );
        } else {
            throw new Error("Invalid type: must be 'regular' or 'range'");
        }

        await medicalRecord.save();

        return { success: true, message: "Expense deleted successfully" };
    } catch (err) {
        console.error("Error deleting Medical expense:", err);
        throw new Error(err.message || "Failed to delete Medical expense");
    }
};
