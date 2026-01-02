import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface CreatePasteRequest {
    content: string;
    title?: string;
    expiresIn?: number;
    maxViews?: number;
}

export interface CreatePasteResponse {
    id: string;
    url: string;
    title: string | null;
    createdAt: string;
    expiresAt: string | null;
    maxViews: number | null;
}

export interface PasteResponse {
    id: string;
    content: string;
    title: string | null;
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
    maxViews: number | null;
}

export const createPaste = async (data: CreatePasteRequest): Promise<CreatePasteResponse> => {
    const response = await api.post<CreatePasteResponse>('/pastes', data);
    return response.data;
};

export const getPaste = async (id: string): Promise<PasteResponse> => {
    const response = await api.get<PasteResponse>(`/pastes/${id}`);
    return response.data;
};

export default api;
