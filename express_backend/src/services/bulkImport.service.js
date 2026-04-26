import xlsx from "xlsx";
import Employee from "../models/employee.model.js";
import EmployeeEpf from "../models/employeeEpf.model.js";
import EPF from "../models/epf.model.js";

/**
 * Process a bulk import of medical/EPF expenses from an Excel buffer.
 * Expected Columns: EPF_Number, Year, Date, Amount, Type, Range_Name (optional)
 */
export const processBulkEpfImport = async (buffer) => {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = {
        successCount: 0,
        failCount: 0,
        errors: [],
    };

    const epfConfig = await EPF.findOne({});
    const maxLimit = epfConfig?.maxEpf || 15000;

    for (const [index, row] of data.entries()) {
        const rowNum = index + 2; // +1 for 0-index, +1 for header
        try {
            const { EPF_Number, Year, Date: dateVal, Amount, Type, Range_Name } = row;

            // 1. Basic Validation
            if (!EPF_Number || !Year || !dateVal || !Amount || !Type) {
                throw new Error(`Missing required fields at row ${rowNum}`);
            }

            const epfNo = EPF_Number.toString().trim();
            const yearNum = parseInt(Year);
            const amountNum = parseFloat(Amount);
            const expDate = new Date(dateVal);

            if (isNaN(yearNum) || isNaN(amountNum) || isNaN(expDate.getTime())) {
                throw new Error(`Invalid data types at row ${rowNum}`);
            }

            // 2. Find Employee
            const employee = await Employee.findOne({ epfNumber: epfNo });
            if (!employee) {
                throw new Error(`Employee with EPF ${epfNo} not found (row ${rowNum})`);
            }

            // 3. Prepare Year Range
            const startOfYear = new Date(Date.UTC(yearNum, 0, 1));
            const endOfYear = new Date(Date.UTC(yearNum + 1, 0, 1));

            // 4. Find/Create Yearly Record
            let record = await EmployeeEpf.findOne({ 
                user: employee._id, 
                year: { $gte: startOfYear, $lt: endOfYear } 
            });

            if (!record) {
                record = new EmployeeEpf({
                    user: employee._id,
                    year: startOfYear,
                    regularExpenses: [],
                    rangeExpenses: []
                });
            }

            // 5. Add Expense
            const newExpense = {
                amount: amountNum,
                expensedAt: expDate
            };

            if (Type.toLowerCase() === "regular") {
                record.regularExpenses.push(newExpense);
            } else if (Type.toLowerCase() === "range") {
                if (!Range_Name) throw new Error(`Range_Name required for type 'range' at row ${rowNum}`);
                
                let range = record.rangeExpenses.find(r => r.name.toLowerCase() === Range_Name.toLowerCase());
                if (!range) {
                    range = { name: Range_Name, expenses: [] };
                    record.rangeExpenses.push(range);
                }
                range.expenses.push(newExpense);
            } else {
                throw new Error(`Invalid Type '${Type}' at row ${rowNum}. Use 'regular' or 'range'.`);
            }

            // 6. Recalculate Total and Validate Limit
            const totalRegular = record.regularExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const totalRange = record.rangeExpenses.reduce(
                (sum, r) => sum + r.expenses.reduce((s, e) => s + (e.amount || 0), 0),
                0
            );
            const totalExpense = totalRegular + totalRange;

            if (totalExpense > maxLimit) {
                throw new Error(`Total expense (Rs. ${totalExpense}) exceeds limit (Rs. ${maxLimit}) for EPF ${epfNo} at row ${rowNum}`);
            }

            record.expense = totalExpense;
            await record.save();
            results.successCount++;

        } catch (err) {
            results.failCount++;
            results.errors.push({ row: rowNum, message: err.message });
        }
    }

    return results;
};
