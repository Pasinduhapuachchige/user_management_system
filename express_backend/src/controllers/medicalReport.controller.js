import { generateEmployeeMedicalReport } from '../services/generateEmployeeMedicalReport.service.js';
import { generateMedicalSummaryReport } from '../services/generateMedicalSummaryReport.service.js';

/**
 * @desc Generate and return an Employee Medical Report (PDF)
 * @route GET /api/reports/medical/:employeeId/:year
 * @access Private
 */
export const getEmployeeMedicalReportController = async (req, res) => {
    try {
        const { employeeId, year } = req.params;

        if (!employeeId || !year) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and Year are required.",
            });
        }

        const pdfBuffer = await generateEmployeeMedicalReport(employeeId, year);

        // ✅ Proper headers to trigger download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=medical_report_${employeeId}_${year}.pdf`
        );

        // ✅ End response with binary data
        res.end(pdfBuffer);
    } catch (error) {
        console.error("Medical report generation failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate Medical report.",
            error: error.message,
        });
    }
};

/**
 * @desc Generate and return a Full Company Medical Summary Report (PDF)
 * @route GET /api/reports/medical-summary/:year
 * @access Private
 */
export const getMedicalSummaryReportController = async (req, res) => {
    try {
        const { year } = req.params;

        if (!year) {
            return res.status(400).json({ success: false, message: "Year is required." });
        }

        const pdfBuffer = await generateMedicalSummaryReport(year);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=medical_summary_report_${year}.pdf`);

        res.end(pdfBuffer);
    } catch (error) {
        console.error("Medical summary generation failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate medical summary report.",
            error: error.message,
        });
    }
};
