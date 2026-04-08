import mongoose from 'mongoose';
import Employee from '../src/models/employee.model.js';
import Admin from '../src/models/admin.model.js';
import { registerAdmin } from '../src/services/register.service.js';
import dotenv from 'dotenv';

dotenv.config();

const sync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/UMS');
        console.log('Connected to DB');

        const employees = await Employee.find({});
        const admins = await Admin.find({});
        const existingEpfNos = new Set(admins.map(a => a.epfNo));

        console.log(`Found ${employees.length} employees and ${admins.length} existing admin accounts.`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const emp of employees) {
            const epf = parseInt(emp.epfNumber);
            if (!isNaN(epf) && !existingEpfNos.has(epf)) {
                try {
                    await registerAdmin({
                        email: emp.email || `${emp.epfNumber}@system.local`,
                        epfNo: epf,
                        password: 'Employee@123',
                        role: 'employee'
                    });
                    console.log(`Created account for EPF: ${epf}`);
                    createdCount++;
                } catch (err) {
                    console.error(`Failed to sync emp ${emp.epfNumber}:`, err.message);
                    skippedCount++;
                }
            } else {
                skippedCount++;
            }
        }

        console.log(`Sync completed. Created: ${createdCount}, Skipped: ${skippedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

sync();
