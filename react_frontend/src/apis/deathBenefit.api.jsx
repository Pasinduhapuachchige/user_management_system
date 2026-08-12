import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

export const getDeathBenefitConfigApi = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/death-benefit/config`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching death benefit config:", error);
        throw error;
    }
};

export const updateDeathBenefitConfigApi = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/death-benefit/config`, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error updating death benefit config:", error);
        throw error;
    }
};

export const getDeathBenefitsApi = async (params = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/death-benefit/records`, {
            params,
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching death benefit records:", error);
        throw error;
    }
};

export const createDeathBenefitApi = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/death-benefit/records`, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error creating death benefit record:", error);
        throw error;
    }
};

export const updateDeathBenefitApi = async (id, data) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/death-benefit/records/${id}`, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error updating death benefit record:", error);
        throw error;
    }
};

export const deleteDeathBenefitApi = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/death-benefit/records/${id}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error deleting death benefit record:", error);
        throw error;
    }
};
