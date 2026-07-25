import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import unzipper from 'unzipper';
import dotenv from 'dotenv';
dotenv.config();

const BACKUP_DIR = path.resolve('backups');
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.BACKUP_ENCRYPTION_KEY || 'default_key').digest();

async function decryptBackup() {
    try {
        // Find latest .zip.enc file or use passed argument
        const args = process.argv.slice(2);
        let backupFileName = args[0];

        if (!backupFileName) {
            const files = (await fs.readdir(BACKUP_DIR)).filter(f => f.endsWith('.zip.enc'));
            if (files.length === 0) {
                console.error('❌ No .zip.enc backup files found in express_backend/backups/');
                process.exit(1);
            }
            // Sort to get newest
            files.sort((a, b) => {
                return fs.statSync(path.join(BACKUP_DIR, b)).mtimeMs - fs.statSync(path.join(BACKUP_DIR, a)).mtimeMs;
            });
            backupFileName = files[0];
        }

        const encryptedFilePath = path.join(BACKUP_DIR, backupFileName.replace(/^.*[\\\/]/, ''));
        const ivFilePath = `${encryptedFilePath}.iv`;

        if (!await fs.pathExists(encryptedFilePath)) {
            console.error(`❌ Encrypted backup file not found: ${encryptedFilePath}`);
            process.exit(1);
        }

        if (!await fs.pathExists(ivFilePath)) {
            console.error(`❌ IV key file not found: ${ivFilePath}`);
            process.exit(1);
        }

        console.log(`🔓 Decrypting: ${path.basename(encryptedFilePath)}`);

        // Load IV
        const ivHex = (await fs.readFile(ivFilePath, 'utf8')).trim();
        const iv = Buffer.from(ivHex, 'hex');

        // Output extract folder
        const extractFolderName = `extracted-${path.basename(encryptedFilePath, '.zip.enc')}`;
        const outputDir = path.join(BACKUP_DIR, extractFolderName);
        const tempZipPath = path.join(BACKUP_DIR, 'temp-decrypted.zip');

        await fs.ensureDir(outputDir);

        // Decrypt
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        const input = fs.createReadStream(encryptedFilePath);
        const output = fs.createWriteStream(tempZipPath);

        await new Promise((resolve, reject) => {
            input.pipe(decipher).pipe(output).on('finish', resolve).on('error', reject);
        });

        // Unzip
        await fs.createReadStream(tempZipPath).pipe(unzipper.Extract({ path: outputDir })).promise();
        await fs.remove(tempZipPath);

        console.log(`\n✅ Backup decrypted and unpacked successfully!`);
        console.log(`📁 Extracted contents folder: ${outputDir}`);
        console.log(`   Inside you will find:`);
        console.log(`   - JSON files for all database collections (employees.json, admins.json, etc.)`);
        console.log(`   - Uploaded assets (uploads folder)`);
        console.log(`   - Environment configuration (.env file)\n`);

    } catch (err) {
        console.error('❌ Decryption failed:', err.message);
        process.exit(1);
    }
}

decryptBackup();
