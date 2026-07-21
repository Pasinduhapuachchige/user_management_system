import express from 'express';
import { loginController } from '../controllers/login.controller.js';
import { 
    deleteAccountController, 
    getAdminsController, 
    registerController, 
    resetAdminPasswordController, 
    tougleAccountStatusController,
    syncEmployeesToAdminsController
} from '../controllers/register.controller.js';
import { logoutController } from '../controllers/logout.controller.js';
import { verifyAuth, verifySuperAdmin } from '../middleware/checkauth.middleware.js';
import { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment, toggleDepartmentStatus }
    from '../controllers/department.controller.js';

const router = express.Router();
import { upload } from '../middleware/multer.middleware.js'
import { createEmployeeController, toggleEmployeeStatusController, getEmployeesController, updateEmployeeController } from '../controllers/employee.controller.js';
import { createOrUpdateEmployeeEpfController, deleteEmployeeEpfExpenseController, getEmployeeEpfsController, getMaxEpfController, updateMaxEpfController } from '../controllers/epf.controller.js';
import { getEmployeesByQuery } from '../services/employee.service.js';
import { departmentStats, epfMonthlyContribution, statsController, getSystemHealth, getRecentActivity } from '../controllers/stats.controller.js';
import { accountRecoveryController, recoveryUpdatePassword, updatePasswordController, validateOtpController } from '../controllers/recovery.controller.js';
import { handleBackupDownload } from '../controllers/backup.controller.js';
import { handleRestore } from '../controllers/restore.controller.js';
import { getEmployeeEpfReportController, getMedicalSummaryReportController } from '../controllers/epfReport.controller.js';
import { initSuperAdminController } from '../controllers/init.controller.js';
import { bulkImportEpfController } from '../controllers/bulkImport.controller.js';
import {
    sendNotificationController,
    getNotificationsController,
    markReadController,
    markAllReadController,
    deleteNotificationController,
} from '../controllers/notification.controller.js';
import { getMaintenanceSettingsController, updateMaintenanceSettingsController } from '../controllers/settings.controller.js';
import { handleSupportContact } from '../controllers/support.controller.js';


import { createRateLimiter } from '../middleware/rateLimit.middleware.js';

// Rate limiters for sensitive routes
const loginRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many login attempts.' });
const recoveryRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many recovery attempts.' });

// Public health-check (no auth required) — used by the login page connection indicator
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        maintenance: !!global.maintenanceModeActive,
        message: global.maintenanceMessage || ''
    });
});

router.post('/login', loginRateLimiter, loginController);

router.post('/register', verifySuperAdmin, registerController);
router.post('/init-superadmin', initSuperAdminController);
router.get('/logout', logoutController);

router.post('/emp/', verifyAuth, upload.single('profilePicture'), createEmployeeController);
router.put('/emp/:id', verifyAuth, upload.single('profilePicture'), updateEmployeeController);
router.patch('/emp/:id/status', verifyAuth, toggleEmployeeStatusController);
router.get('/emp/', verifyAuth, getEmployeesController);

router.post('/department', verifyAuth, createDepartment);
router.get('/department', verifyAuth, getAllDepartments);
router.get('/department/:id', verifyAuth, getDepartmentById);
router.put('/department/:id', verifyAuth, updateDepartment);
router.delete('/department/:id', verifyAuth, deleteDepartment);
router.patch('/department/:id/status', verifyAuth, toggleDepartmentStatus);

router.post('/epf/max', verifyAuth, updateMaxEpfController);
router.get('/epf/max', verifyAuth, getMaxEpfController);
router.get("/epf/emp", verifyAuth, getEmployeeEpfsController);
router.post("/epf/emp", verifyAuth, createOrUpdateEmployeeEpfController);
router.post("/epf/bulk-import", verifyAuth, upload.single('file'), bulkImportEpfController);
router.delete("/epf/emp/:epfId", verifyAuth, deleteEmployeeEpfExpenseController);

router.get('/admins', verifySuperAdmin, getAdminsController);
router.post('/admins', verifySuperAdmin, tougleAccountStatusController);
router.delete('/admins', verifySuperAdmin, deleteAccountController);
router.put('/admins/reset-password', verifySuperAdmin, resetAdminPasswordController);
router.post('/admins/sync-employees', verifySuperAdmin, syncEmployeesToAdminsController);

router.get('/stats', verifyAuth, statsController);
router.get('/stats/dep', verifyAuth, departmentStats)
router.get('/stats/epf', verifyAuth, epfMonthlyContribution)
router.get('/stats/health', verifySuperAdmin, getSystemHealth)
router.get('/stats/activity', verifySuperAdmin, getRecentActivity)

router.post('/recovery/otp', recoveryRateLimiter, accountRecoveryController);
router.post('/recovery/validate-otp', recoveryRateLimiter, validateOtpController);
router.post('/recovery/update-pwd', recoveryRateLimiter, recoveryUpdatePassword);

router.put('/update-pwd', verifyAuth, updatePasswordController);
router.post('/support/contact', verifyAuth, handleSupportContact);

router.get('/settings/maintenance', verifyAuth, getMaintenanceSettingsController);
router.post('/settings/maintenance', verifySuperAdmin, updateMaintenanceSettingsController);

router.get('/backup', verifySuperAdmin, handleBackupDownload);
//router.post('/restore', handleRestore);

router.get('/reports/epf/:employeeId/:year', verifyAuth, getEmployeeEpfReportController);
router.get('/reports/medical-summary/:year', verifyAuth, getMedicalSummaryReportController);

// Notification routes
router.post('/notifications', verifySuperAdmin, sendNotificationController);
router.get('/notifications', verifyAuth, getNotificationsController);
router.put('/notifications/read-all', verifyAuth, markAllReadController);
router.put('/notifications/:id/read', verifyAuth, markReadController);
router.delete('/notifications/:id', verifySuperAdmin, deleteNotificationController);

router.get('/check-auth', verifyAuth, async (req, res) => {
    let name = undefined;

    // Try the Employee collection first (most users)
    const employees = await getEmployeesByQuery({ email: req.user.email });
    if (employees && employees.length > 0) {
        name = employees[0]?.name;
    }

    // Fallback: look up in the Admin collection (superadmin has no employee record)
    if (!name) {
        const { getAdmins } = await import('../services/register.service.js');
        const admins = await getAdmins({ _id: req.user._id });
        name = admins[0]?.email?.split('@')[0] || 'Super Admin';
    }

    res.status(200).json({
        success: true,
        user: {
            _id: req.user._id,
            email: req.user.email,
            name,
            role: req.user.role
        }
    });
});

export default router;