import { processBulkEpfImport } from "../services/bulkImport.service.js";

/**
 * Handle bulk import request from the frontend.
 * @route POST /api/v1/epf/bulk-import
 * @access Private
 */
export const bulkImportEpfController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        const results = await processBulkEpfImport(req.file.buffer);

        res.status(200).json({
            success: true,
            summary: {
                totalRows: results.successCount + results.failCount,
                successCount: results.successCount,
                failCount: results.failCount,
            },
            errors: results.errors,
        });

    } catch (err) {
        console.error("Bulk Import Controller Error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error during bulk import.",
            error: err.message || err,
        });
    }
};
