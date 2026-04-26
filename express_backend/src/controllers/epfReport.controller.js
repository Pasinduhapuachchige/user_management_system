import { generateEmployeeEpfReport } from '../services/generateEmployeeEpfReport.service.js';
import { generateMedicalSummaryReport } from '../services/generateMedicalSummaryReport.service.js';

/**
 * @desc Generate and return an Employee EPF Report (PDF)
 * @route GET /api/reports/epf/:employeeId/:year
 * @access Private (or adjust based on your auth setup)
 */
export const getEmployeeEpfReportController = async (req, res) => {
    try {
        const { employeeId, year } = req.params;

        if (!employeeId || !year) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and Year are required.",
            });
        }

        const pdfBuffer = await generateEmployeeEpfReport(employeeId, year);

        // ✅ Proper headers to trigger download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=epf_report_${employeeId}_${year}.pdf`
        );

        // ✅ End response with binary data
        res.end(pdfBuffer);
    } catch (error) {
        console.error("EPF report generation failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate EPF report.",
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
  