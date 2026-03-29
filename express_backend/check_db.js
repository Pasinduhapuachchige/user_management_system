import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import Admin from './src/models/admin.model.js';
import Employee from './src/models/employee.model.js';

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user_management_system').then(async () => {
    try {
        const admins = await Admin.find({});
        console.log("Admins in DB:");
        console.table(admins.map(a => ({ email: a.email, epfNo: a.epfNo, role: a.role })));
        
        const employees = await Employee.find({}, 'email epfNumber name');
        console.log("\nSample Employees in DB:");
        console.table(employees.slice(0, 10).map(e => ({ name: e.name, email: e.email, epf: e.epfNumber })));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
