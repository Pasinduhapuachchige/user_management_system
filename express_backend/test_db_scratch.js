import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './src/models/department.model.js'; // Ensure Department schema is registered
import { registerAdmin, getAdmins } from './src/services/register.service.js';
import { getEmployeesByQuery } from './src/services/employee.service.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/UMS';

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const employees = await getEmployeesByQuery({});
    const admins = await getAdmins();
    const existingEpfNos = new Set(admins.map(a => a.epfNo));

    console.log(`Found ${employees.length} employees and ${admins.length} admins.`);

    for (const emp of employees) {
        const epf = parseInt(emp.epfNumber);
        if (!existingEpfNos.has(epf)) {
            console.log(`Syncing employee: ${emp.name} (EPF: ${emp.epfNumber} -> parsed: ${epf}, email: ${emp.email})`);
            try {
                const admin = await registerAdmin({
                    email: emp.email || `${emp.epfNumber}@system.local`,
                    epfNo: epf,
                    password: 'Employee@123',
                    role: 'employee'
                });
                console.log(`Successfully synced ${emp.name} as admin id ${admin._id}`);
            } catch (err) {
                console.error(`Failed to sync emp ${emp.epfNumber}: ${err.message}`);
            }
        } else {
            console.log(`Skipped ${emp.name} (EPF ${epf}) - already exists in admins list.`);
        }
    }

    await mongoose.disconnect();
}

run().catch(console.error);
