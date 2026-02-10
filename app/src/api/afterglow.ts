import api from './axios';

export interface Afterglow {
    _id: string;
    title: string;
    content: string;
    author: {
        _id: string;
        username: string;
        email: string;
        displayName?: string;
    };
    tags: string[];
    photos: string[]; // S3 URLs or base64
    eventRef?: {  // Event reference (populated from backend)
        _id: string;
        title: string;
        category: string;
        date: string;
        location: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateAfterglowData {
    title: string;
    content: string;
    photos?: string[];
    tags?: string[];
    eventRef?: string;  // Event ID to link
}

export const afterglowApi = {
    getAllAfterglows: async (): Promise<Afterglow[]> => {
        const response = await api.get('/afterglows');  // Using new /afterglows endpoint
        return response.data;
    },

    getAfterglowById: async (id: string): Promise<Afterglow> => {
        const response = await api.get(`/afterglows/${id}`);
        return response.data;
    },

    createAfterglow: async (data: CreateAfterglowData): Promise<Afterglow> => {
        const response = await api.post('/afterglows', data);
        return response.data.afterglow;  // Backend returns { message, afterglow }
    },

    updateAfterglow: async (id: string, data: CreateAfterglowData): Promise<Afterglow> => {
        const response = await api.put(`/afterglows/${id}`, data);
        return response.data.afterglow;  // Backend returns { message, afterglow }
    },

    deleteAfterglow: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/afterglows/${id}`);
        return response.data;
    }
};

export default afterglowApi;
