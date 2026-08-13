import { DeathBenefitRecord } from "../models/deathBenefit.model.js";
import Employee from "../models/employee.model.js";
import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export async function generateDeathDonationReport({ reportScope = 'summary', employeeId = null, year = null, status = null }) {
    try {
        const query = {};

        // Filter by Year if provided and not 'ALL'
        if (year && String(year).toUpperCase() !== 'ALL') {
            const targetYear = parseInt(year);
            if (!isNaN(targetYear)) {
                query.issuedDate = {
                    $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
                    $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`)
                };
            }
        }

        // Filter by Status if provided
        if (status && status !== 'ALL') {
            query.status = status;
        }

        let employee = null;

        // Individual employee scope
        if (reportScope === 'individual') {
            if (!employeeId) {
                throw new Error("Employee ID is required for individual death donation report.");
            }

            employee = await Employee.findById(employeeId).populate('department');
            if (!employee) {
                throw new Error("Employee not found.");
            }

            // Match by employee ObjectId or EPF number
            query.$or = [
                { employee: employee._id },
                { epfNumber: employee.epfNumber }
            ];
        }

        // Query Death Benefit Records
        const records = await DeathBenefitRecord.find(query)
            .populate({
                path: 'employee',
                select: 'name epfNumber department email contactNumber joinedDate',
                populate: { path: 'department', select: 'name' }
            })
            .sort({ issuedDate: -1, createdAt: -1 });

        // Calculate summary statistics
        const totalAmount = records.reduce((sum, rec) => sum + (Number(rec.amount) || 0), 0);
        const paidCount = records.filter(rec => rec.status === 'Paid').length;

        // Prepare Logo
        let logoDataUri = "";
        try {
            const logoPath = path.join(process.cwd(), "src", "assets", "logo.png");
            if (fs.existsSync(logoPath)) {
                const logoBase64 = fs.readFileSync(logoPath).toString("base64");
                logoDataUri = `data:image/png;base64,${logoBase64}`;
            }
        } catch (logoErr) {
            console.warn("Logo not found or error reading logo:", logoErr.message);
        }

        const generatedAt = new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'medium'
        });

        // Render EJS HTML
        const html = await ejs.renderFile(
            path.join(process.cwd(), "src", "views", "deathDonationReportTemplate.view.ejs"),
            {
                logoDataUri,
                reportScope,
                employee,
                records,
                year: year || 'All Time',
                totalAmount,
                paidCount,
                generatedAt
            }
        );

        // Generate PDF via Puppeteer
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
            displayHeaderFooter: true,
            headerTemplate: "<div></div>",
            footerTemplate: `
                <div style="font-size: 8px; width: 100%; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 5px;">
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span> — State Pharmaceuticals Corporation Death Donation Report
                </div>
            `
        });

        await browser.close();
        return pdfBuffer;
    } catch (err) {
        console.error("Death donation report generation failed:", err.message);
        throw err;
    }
}
