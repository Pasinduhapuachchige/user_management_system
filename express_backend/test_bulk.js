import { processBulkEpfImport } from "./src/services/bulkImport.service.js";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/UMS");
        console.log("DB Connected");

        const buffer = fs.readFileSync("test_import.xlsx");
        const results = await processBulkEpfImport(buffer);
        console.log("Import Results:", JSON.stringify(results, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

runTest();
