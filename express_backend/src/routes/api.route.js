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
import { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment }
    from '../controllers/department.controller.js';

const router = express.Router();
import { upload } from '../middleware/multer.middleware.js'
import { createEmployeeController, deleteEmployeeController, getEmployeesController, updateEmployeeController } from '../controllers/employee.controller.js';
import { createOrUpdateEmployeeEpfController, deleteEmployeeEpfExpenseController, getEmployeeEpfsController, getMaxEpfController, updateMaxEpfController } from '../controllers/epf.controller.js';
import { getEmployeesByQuery } from '../services/employee.service.js';
import { departmentStats, epfMonthlyContribution, statsController, getSystemHealth, getRecentActivity } from '../controllers/stats.controller.js';
import { accountRecoveryController, recoveryUpdatePassword, updatePasswordController, validateOtpController } from '../controllers/recovery.controller.js';
import { handleBackupDownload } from '../controllers/backup.controller.js';
import { handleRestore } from '../controllers/restore.controller.js';
import { getEmployeeEpfReportController, getMedicalSummaryReportController } from '../controllers/epfReport.controller.js';
import { initSuperAdminController } from '../controllers/init.controller.js';
import { bulkImportEpfController } from '../controllers/bulkImport.controller.js';

router.post('/login', loginController);
router.post('/register', verifySuperAdmin, registerController);
router.post('/init-superadmin', initSuperAdminController);
router.get('/logout', logoutController);

router.post('/emp/', verifyAuth, upload.single('profilePicture'), createEmployeeController);
router.put('/emp/:id', verifyAuth, upload.single('profilePicture'), updateEmployeeController);
router.delete('/emp/:id', verifyAuth, deleteEmployeeController);
router.get('/emp/', verifyAuth, getEmployeesController);

router.post('/department', verifyAuth, createDepartment);
router.get('/department', verifyAuth, getAllDepartments);
router.get('/department/:id', verifyAuth, getDepartmentById);
router.put('/department/:id', verifyAuth, updateDepartment);
router.delete('/department/:id', verifyAuth, deleteDepartment);

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

router.post('/recovery/otp', accountRecoveryController);
router.post('/recovery/validate-otp', validateOtpController);
router.post('/recovery/update-pwd', recoveryUpdatePassword);

router.put('/update-pwd', verifyAuth, updatePasswordController);

router.get('/backup', handleBackupDownload);
//router.post('/restore', handleRestore);

router.get('/reports/epf/:employeeId/:year', verifyAuth, getEmployeeEpfReportController);
router.get('/reports/medical-summary/:year', verifyAuth, getMedicalSummaryReportController);

router.get('/check-auth', verifyAuth, async (req, res) => {
    const admins = await getEmployeesByQuery({ email: req.user.email })
    const admin = admins[0];

    res.status(200).json({
        success: true,
        user: {
            _id: req.user._id,
            email: req.user.email,
            name: admin?.name,
            role: req.user.role
        }
    });
});

export default router;