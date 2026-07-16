import Settings from '../models/settings.model.js';

export const getMaintenanceSettingsController = async (req, res) => {
    try {
        const modeSetting = await Settings.findOne({ key: 'maintenanceMode' });
        const messageSetting = await Settings.findOne({ key: 'maintenanceMessage' });

        const maintenanceMode = modeSetting ? modeSetting.value === true : false;
        const maintenanceMessage = messageSetting ? messageSetting.value : 'The system is currently undergoing scheduled maintenance. Some features may be temporarily unavailable. We apologise for the inconvenience.';

        return res.status(200).json({
            success: true,
            data: {
                maintenanceMode,
                maintenanceMessage
            }
        });
    } catch (err) {
        console.error('Error fetching maintenance settings:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching settings'
        });
    }
};

export const updateMaintenanceSettingsController = async (req, res) => {
    const { maintenanceMode, maintenanceMessage } = req.body;

    if (maintenanceMode === undefined) {
        return res.status(400).json({
            success: false,
            message: 'maintenanceMode state is required'
        });
    }

    try {
        // Upsert maintenance mode
        await Settings.findOneAndUpdate(
            { key: 'maintenanceMode' },
            { value: maintenanceMode === true },
            { upsert: true, new: true }
        );

        // Update in-memory global state
        global.maintenanceModeActive = maintenanceMode === true;

        // Upsert message if provided
        if (maintenanceMessage !== undefined) {
            await Settings.findOneAndUpdate(
                { key: 'maintenanceMessage' },
                { value: maintenanceMessage },
                { upsert: true, new: true }
            );
            global.maintenanceMessage = maintenanceMessage;
        }

        return res.status(200).json({
            success: true,
            message: `Maintenance Mode successfully ${maintenanceMode ? 'activated' : 'deactivated'}`,
            data: {
                maintenanceMode,
                maintenanceMessage
            }
        });
    } catch (err) {
        console.error('Error updating maintenance settings:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while updating settings'
        });
    }
};
