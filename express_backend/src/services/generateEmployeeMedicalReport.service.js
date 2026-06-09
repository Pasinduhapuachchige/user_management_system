import Employee from "../models/employee.model.js";
import EmployeeMedical from "../models/employeeMedical.model.js";
import Medical from "../models/medical.model.js";
import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "path";
import { log } from "console";
import fs from "fs";

export async function generateEmployeeMedicalReport(employeeId, year) {
    try {
        // 1️⃣ Get employee data
        const employee = await Employee.findById(employeeId).populate("department");
        if (!employee) throw new Error("Employee not found");

        // 2️⃣ Get Medical configuration
        const medicalConfig = await Medical.findOne({});
        if (!medicalConfig) throw new Error("Medical configuration not found");

        // 3️⃣ Get employee Medical data for that year
        const targetYear = parseInt(year);
        const employeeMedical = await EmployeeMedical.findOne({
            user: employeeId,
            year: {
                $gte: new Date(`${targetYear}-01-01`),
                $lte: new Date(`${targetYear}-12-31`)
            },
        });
        if (!employeeMedical)
            throw new Error(`No Medical data found for ${employee.name} in ${year}`);

        // 4️⃣ Prepare detailed range summaries (with date + amount per expense)
        const rangeSummaries = employeeMedical.rangeExpenses.map((range) => {
            const totalAmount = range.expenses.reduce((sum, e) => sum + e.amount, 0);

            const expenseDetails = range.expenses.map((e) => ({
                date: new Date(e.expensedAt).toLocaleDateString(),
                amount: e.amount,
            }));

            return {
                name: range.name,
                totalAmount,
                count: range.expenses.length, // times used
                expenseDetails,
            };
        });

        // 5️⃣ Regular Medical totals and details
        const regularExpenses = employeeMedical.regularExpenses.map((e) => ({
            date: new Date(e.expensedAt).toLocaleDateString(),
            amount: e.amount,
        }));

        const regularTotal = regularExpenses.reduce((sum, e) => sum + e.amount, 0);
        const regularCount = regularExpenses.length; // times used

        // 6️⃣ Total Expenses
        const rangeTotal = rangeSummaries.reduce((sum, r) => sum + r.totalAmount, 0);
        const totalUsed = rangeTotal + regularTotal;
        const totalExpenses = totalUsed;

        // 7️⃣ Medical Usage Overview
        // Assuming medicalConfig.maxMedical is the total yearly limit
        const medicalUsed = totalUsed;
        const medicalRemaining = medicalConfig.maxMedical - medicalUsed;
        const medicalLimit = medicalConfig.maxMedical;

        const logoBase64 = fs.readFileSync(
            path.join(process.cwd(), "src", "assets", "logo.png")
        ).toString("base64");
        const logoDataUri = `data:image/png;base64,${logoBase64}`;

        // 8️⃣ Render EJS to HTML
        const html = await ejs.renderFile(
            path.join(process.cwd(), "src", "views", "medicalReportTemplate.view.ejs"),
            {
                logoDataUri,
                employee,
                year,
                rangeSummaries,
                regularTotal,
                regularCount,
                regularExpenses,
                totalUsed,
                totalExpenses,
                medicalUsed,
                medicalRemaining,
                medicalLimit,
                medicalRecords: employee.medicalRecords || "No significant medical history recorded.",
                medicalConfig,
                generatedAt: new Date().toLocaleString(),
            }
        );

        // 9️⃣ Generate PDF using Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "30mm", bottom: "20mm" },
        });

        await browser.close();
        return pdfBuffer;
    } catch (err) {
        console.error("Medical report generation failed:", err.message);
        throw err;
    }
}
