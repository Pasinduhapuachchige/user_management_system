import { deleteAccount, tougleAccountStatus } from "../services/auth.service.js";
import { getEmployeesByQuery, updateEmployee } from "../services/employee.service.js";
import { passwordGenerator } from "../services/passwordGenerator.service.js";
import { getAdmins, registerAdmin, updatePassword } from "../services/register.service.js";

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
        const [savedAdmin] = await getEmployeesByQuery({ epfNumber: epfNo });

        if (!savedAdmin) {
            return res.status(404).json({ message: 'Employee with this EPF number not found' });
        }

        const admin = await registerAdmin({
            email,
            password: generatedPassword || password,
            epfNo
        });

        // Try to sync the email to the employee record (non-critical)
        let emailSyncWarning = null;
        if (savedAdmin.email !== email) {
            try {
                savedAdmin.email = email;
                await updateEmployee(savedAdmin._id, savedAdmin);
            } catch (syncError) {
                console.error('Failed to sync email to employee record:', syncError.message);
                emailSyncWarning = 'HR Officer account created, but employee email could not be updated.';
            }
        }

        res.status(201).json({
            message: emailSyncWarning || 'HR Officer account created successfully',
            success: true,
            admin: {
                id: admin._id,
                email: admin.email,
                epfNo: admin.epfNo,
                role: admin.role,
                temporaryPassword: generatedPassword || null
            },
        });

    } catch (error) {
        console.error(error.message);

        // Handle MongoDB duplicate key errors with user-friendly messages
        let userMessage = error.message;
        if (error.message && error.message.includes('E11000')) {
            if (error.message.includes('email')) {
                userMessage = 'An account with this email already exists.';
            } else if (error.message.includes('epfNo')) {
                userMessage = 'An account with this EPF number already exists.';
            } else {
                userMessage = 'A duplicate record was found. Please check the details and try again.';
            }
        }

        res.status(400).json({ message: userMessage });
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