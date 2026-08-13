import { generateDeathDonationReport } from '../services/generateDeathDonationReport.service.js';

/**
 * @desc Generate and return a Company-wide Death Donation Summary Report (PDF)
 * @route GET /api/v1/reports/death-donation/summary/:year?
 */
export const getDeathDonationSummaryReportController = async (req, res) => {
    try {
        const year = req.params.year || req.query.year || 'ALL';
        const { status } = req.query;

        const pdfBuffer = await generateDeathDonationReport({
            reportScope: 'summary',
            year,
            status: status || 'ALL'
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=death_donation_summary_${year}.pdf`
        );

        res.end(pdfBuffer);
    } catch (error) {
        console.error("Death donation summary report generation failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate death donation summary report.",
            error: error.message,
        });
    }
};

/**
 * @desc Generate and return an Individual Employee Death Donation Report (PDF)
 * @route GET /api/v1/reports/death-donation/individual/:employeeId/:year?
 */
export const getIndividualDeathDonationReportController = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const year = req.params.year || req.query.year || 'ALL';
        const { status } = req.query;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required.",
            });
        }

        const pdfBuffer = await generateDeathDonationReport({
            reportScope: 'individual',
            employeeId,
            year,
            status: status || 'ALL'
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=death_donation_individual_${employeeId}_${year}.pdf`
        );

        res.end(pdfBuffer);
    } catch (error) {
        console.error("Individual death donation report generation failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate individual death donation report.",
            error: error.message,
        });
    }
};
