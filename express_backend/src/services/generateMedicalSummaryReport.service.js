import Employee from "../models/employee.model.js";
import EmployeeEpf from "../models/employeeEpf.model.js";
import EPF from "../models/epf.model.js";
import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export async function generateMedicalSummaryReport(year) {
    try {
        // 1. Get EPF configuration (to get total yearly limit)
        const epfConfig = await EPF.findOne({});
        const medicalLimit = epfConfig?.maxEpf || 15000;

        // 2. Get all employees
        const employees = await Employee.find({ isActive: { $ne: false } })
            .populate("department")
            .sort({ epfNumber: 1 });

        // 3. Get all EPF data for the given year
        // We use a date range or the year field
        const targetYear = parseInt(year);
        const epfRecords = await EmployeeEpf.find({
            year: {
                $gte: new Date(`${targetYear}-01-01`),
                $lte: new Date(`${targetYear}-12-31`)
            }
        });

        // 4. Map records to employee ID for quick lookup
        const empData = {};
        let totalSpent = 0;

        epfRecords.forEach(record => {
            // Correctly sum all expenses within this record
            const rangeSum = record.rangeExpenses.reduce((sum, range) => {
                return sum + range.expenses.reduce((s, e) => s + e.amount, 0);
            }, 0);
            const regularSum = record.regularExpenses.reduce((sum, e) => sum + e.amount, 0);
            const recordTotal = rangeSum + regularSum;

            empData[record.user.toString()] = {
                spent: recordTotal,
                records: record
            };
            totalSpent += recordTotal;
        });

        // 5. Prepare Logo
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

        // 6. Characterize report status
        const generatedAt = new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'medium'
        });

        // 7. Render EJS to HTML
        const html = await ejs.renderFile(
            path.join(process.cwd(), "src", "views", "medicalSummaryTemplate.view.ejs"),
            {
                logoDataUri,
                employees,
                empData,
                year: targetYear,
                medicalLimit,
                totalSpent,
                generatedAt
            }
        );

        // 8. Generate PDF using Puppeteer
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
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span> — State Pharmaceuticals Corporation Medical Summary ${targetYear}
                </div>
            `
        });

        await browser.close();
        return pdfBuffer;
    } catch (err) {
        console.error("Medical summary generation failed:", err.message);
        throw err;
    }
}
