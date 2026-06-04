import api from "./api";

export const getHealth = async () => {
    try {
        const response = await api.get("/health");
        return response.data;
    } catch (error) {
        console.error("Error checking health:", error);
        throw error;
    }
};