import axios from "axios";

export const getMaintenanceSettings = async () => {
    try {
        const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/settings/maintenance`,
            { withCredentials: true }
        );
        return res.data;
    } catch (err) {
        console.error('Error in getMaintenanceSettings:', err);
        throw err.response?.data || { message: err.message };
    }
};

export const updateMaintenanceSettings = async (formData) => {
    try {
        const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/settings/maintenance`,
            formData,
            { withCredentials: true }
        );
        return res.data;
    } catch (err) {
        console.error('Error in updateMaintenanceSettings:', err);
        throw err.response?.data || { message: err.message };
    }
};
