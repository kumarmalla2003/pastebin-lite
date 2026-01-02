import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request types
export interface CreatePasteRequest {
    content: string;
    title: string;
    expiresIn: number;
    maxViews?: number;
}

// Response types
export interface CreatePasteResponse {
    id: string;
    url: string;
    title: string;
    createdAt: string;
    expiresAt: string;
}

export interface PasteResponse {
    id: string;
    content: string;
    title: string | null;
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
}

export interface PasteListItem {
    id: string;
    title: string | null;
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
}

// API functions
export const createPaste = async (data: CreatePasteRequest): Promise<CreatePasteResponse> => {
    const response = await api.post<CreatePasteResponse>('/pastes', data);
    return response.data;
};

export const getPaste = async (id: string): Promise<PasteResponse> => {
    const response = await api.get<PasteResponse>(`/pastes/${id}`);
    return response.data;
};

export const getAllPastes = async (): Promise<PasteListItem[]> => {
    const response = await api.get<{ pastes: PasteListItem[] }>('/pastes');
    return response.data.pastes;
};

export const deletePaste = async (id: string): Promise<void> => {
    await api.delete(`/pastes/${id}`);
};

export const deleteAllPastes = async (): Promise<void> => {
    await api.delete('/pastes');
};

export const incrementView = async (id: string, signal?: AbortSignal): Promise<void> => {
    await api.post(`/pastes/${id}/view`, {}, { signal });
};

export default api;
