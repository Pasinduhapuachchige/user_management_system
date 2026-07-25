import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';

import apiRoutes from './src/routes/api.route.js'
import { errorHandler } from './src/middleware/errorHandler.middleware.js';
import { createSystemBackup } from './src/services/backup.service.js';
import { cleanupOldBackups } from './src/controllers/backup.controller.js';

dotenv.config();

// Create app
const app = express();

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Middleware
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = clientUrl 
    ? clientUrl.split(',').map(url => url.trim()) 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) || origin.startsWith('http://localhost:');
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/prop', express.static(path.join('src', 'uploads')));


app.get('/', (req, res) => {
    res.send('Server is running 🚀');
});

//API Routes
app.use('/api/v1', apiRoutes);

// Centralized Error Handler Middleware
app.use(errorHandler);

//Cron
// Schedule daily at 3:00 AM
cron.schedule('0 3 * * *', async () => {
    try {
        console.log('📦 Scheduled Backup Started');
        await createSystemBackup();
        await cleanupOldBackups();
    } catch (err) {
        console.error('Scheduled Backup Error:', err);
    }
});

await mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log(`MongoDB Connected.`)
        
        // Initialize global maintenance state
        try {
            const Settings = (await import('./src/models/settings.model.js')).default;
            const maintenanceSetting = await Settings.findOne({ key: 'maintenanceMode' });
            global.maintenanceModeActive = maintenanceSetting ? maintenanceSetting.value === true : false;
            
            const messageSetting = await Settings.findOne({ key: 'maintenanceMessage' });
            global.maintenanceMessage = messageSetting ? messageSetting.value : 'The system is currently undergoing scheduled maintenance. Some features may be temporarily unavailable. We apologise for the inconvenience.';
            
            console.log(`✅ Maintenance Mode status loaded: ${global.maintenanceModeActive}`);
        } catch (err) {
            console.error('Failed to load Maintenance Mode status:', err);
            global.maintenanceModeActive = false;
            global.maintenanceMessage = 'The system is currently undergoing scheduled maintenance. Some features may be temporarily unavailable. We apologise for the inconvenience.';
        }

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✅ Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((e) => {
        console.log(`Connection error: ${e}`);
    })