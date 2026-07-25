import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Trigger backend database backup download with credentials
 */
export const downloadBackupApi = async () => {
    try {
        const response = await axios.get(`${BACKEND}/api/v1/backup`, {
            withCredentials: true,
            responseType: 'blob'
        });

        // Extract filename from response header if available, or generate timestamp filename
        const contentDisposition = response.headers['content-disposition'];
        let filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip.enc`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        // Create blob link and auto-trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
    } catch (err) {
        console.error('Error downloading backup:', err);
        // Decode blob message if error returned as JSON blob
        let message = 'Failed to download backup';
        if (err.response?.data instanceof Blob) {
            try {
                const text = await err.response.data.text();
                const parsed = JSON.parse(text);
                message = parsed.message || message;
            } catch {
                // fallback to default error string
            }
        } else if (err.response?.data?.message) {
            message = err.response.data.message;
        } else if (err.message) {
            message = err.message;
        }
        throw new Error(message);
    }
};
