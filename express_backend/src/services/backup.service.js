import mongoose from 'mongoose';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import archiver from 'archiver';
import crypto from 'crypto';
dotenv.config();

const BACKUP_DIR = path.resolve('backups');

export const createSystemBackup = async () => {
    try {
        const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.BACKUP_ENCRYPTION_KEY).digest(); // 32-byte key
        const IV = crypto.randomBytes(16); // Unique IV for each backup run

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tempDir = path.join(BACKUP_DIR, `temp-${timestamp}`);
        const zipFile = path.join(BACKUP_DIR, `backup-${timestamp}.zip`);
        const encryptedFile = `${zipFile}.enc`;

        await fs.ensureDir(tempDir);
        
        // Use existing connection instead of connecting/closing
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }

        const collections = await db.collections();

        for (const collection of collections) {
            const data = await collection.find({}).toArray();
            const filePath = path.join(tempDir, `${collection.collectionName}.json`);
            await fs.writeJson(filePath, data, { spaces: 2 });
        }

        // Include uploads but NOT .env
        await fs.copy('./src/uploads', path.join(tempDir, 'uploads'));
        // Removed: await fs.copy('./.env', path.join(tempDir, '.env'));

        // Zip
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipFile);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', resolve);
            archive.on('error', reject);

            archive.pipe(output);
            archive.directory(tempDir, false);
            archive.finalize();
        });

        // Encrypt
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
        const input = fs.createReadStream(zipFile);
        const output = fs.createWriteStream(encryptedFile);

        await new Promise((resolve, reject) => {
            input.pipe(cipher).pipe(output).on('finish', resolve).on('error', reject);
        });

        // Save IV
        await fs.writeFile(`${encryptedFile}.iv`, IV.toString('hex'));

        // Cleanup
        await fs.remove(tempDir);
        await fs.remove(zipFile);

        console.log(`✅ Backup created: ${encryptedFile}`);
        return encryptedFile;

    } catch (err) {
        console.error('❌ Backup failed:', err);
        throw err;
    }
    // Removed mongoose.connection?.close?() as it breaks the application
};
