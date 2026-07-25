import { createSystemBackup } from '../src/services/backup.service.js';

console.log('📦 Starting Manual Database Backup...');

try {
    const backupFile = await createSystemBackup();
    console.log(`\n✅ Backup Created Successfully!`);
    console.log(`📍 Backup Location: ${backupFile}\n`);
    process.exit(0);
} catch (err) {
    console.error('❌ Backup Failed:', err);
    process.exit(1);
}
