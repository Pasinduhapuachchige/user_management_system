import { deleteAccount, tougleAccountStatus } from "../services/auth.service.js";
import { getEmployeesByQuery, updateEmployee } from "../services/employee.service.js";
import { passwordGenerator } from "../services/passwordGenerator.service.js";
import { getAdmins, registerAdmin, updatePassword } from "../services/register.service.js";
import { sendCredentials } from "../services/sendCredentials.service.js";

export const registerController = async (req, res) => {
    const { email, password, epfNo } = req.body;
    let generatedPassword = null;

    if (!email || !epfNo) {
        return res.status(400).json({ message: 'Email and EPF number are required' });
    }

    if (!password) {
        generatedPassword = passwordGenerator();
    }

    try {
        const admin = await registerAdmin({
            email,
            password: generatedPassword || password,
            epfNo
        });

        const [savedAdmin] = await getEmployeesByQuery({ epfNumber: epfNo });

        if (!savedAdmin) {
            return res.status(404).json({ message: 'Employee with this EPF number not found' });
        }

        if (savedAdmin.email !== email) {
            savedAdmin.email = email;
            await updateEmployee(savedAdmin._id, savedAdmin);
        }

        await sendCredentials({
            email,
            name: savedAdmin.name || 'New Admin',
            password: generatedPassword || password
        });

        res.status(201).json({
            message: 'Admin registered successfully',
            success: true,
            admin: {
                id: admin._id,
                email: admin.email,
                epfNo: admin.epfNo,
            },
        });

    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
};


export const getAdminsController = async (req, res) => {
    try {
        const admins = await getAdmins();
        res.status(200).json(admins);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching admins' });
    }
};

export const tougleAccountStatusController = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) return res.status(403).json({ message: "ID is not provided" });

        const response = await tougleAccountStatus(_id);

        if (response.success != true) {
            return res.status(403).json({ message: "Something Went Wrong" })
        }

        return res.status(200).json(response)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const deleteAccountController = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) return res.status(403).json({ message: "ID is not provided" });

        const response = await deleteAccount(_id);

        if (response.success != true) {
            return res.status(403).json({ message: "Something Went Wrong" })
        }

        return res.status(200).json(response)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const resetAdminPasswordController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const result = await updatePassword(email, password);
        if (!result.success) {
            return res.status(500).json({ message: result.message || "Failed to update password" });
        }
        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
};

export const syncEmployeesToAdminsController = async (req, res) => {
    try {
        const employees = await getEmployeesByQuery({});
        const admins = await getAdmins();
        const existingEpfNos = new Set(admins.map(a => a.epfNo));

        let createdCount = 0;
        let skippedCount = 0;

        for (const emp of employees) {
            const epf = parseInt(emp.epfNumber);
            if (!existingEpfNos.has(epf)) {
                try {
                    await registerAdmin({
                        email: emp.email || `${emp.epfNumber}@system.local`,
                        epfNo: epf,
                        password: 'Employee@123',
                        role: 'employee'
                    });
                    createdCount++;
                } catch (err) {
                    console.error(`Failed to sync emp ${emp.epfNumber}:`, err.message);
                    skippedCount++;
                }
            } else {
                skippedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Sync completed. Created: ${createdCount}, Skipped/Existing: ${skippedCount}`,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};