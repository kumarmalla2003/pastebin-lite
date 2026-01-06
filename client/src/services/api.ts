import axios from 'axios';

// In production, use relative paths (Vercel rewrites handle proxying to backend)
// In development, use VITE_API_URL or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request types (spec-compliant)
export interface CreatePasteRequest {
    content: string;
    ttl_seconds?: number;  // optional, integer >= 1
    max_views?: number;    // optional, integer >= 1
}

// Response types (spec-compliant)
export interface CreatePasteResponse {
    id: string;
    url: string;
}

// API fetch response per spec
export interface PasteApiResponse {
    content: string;
    remaining_views: number | null;
    expires_at: string | null;
}

// Extended response for internal UI use
export interface PasteResponse {
    id: string;
    content: string;
    title: string | null;
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
    maxViews: number | null;
}

export interface PasteListItem {
    id: string;
    title: string | null;
    createdAt: string;
    expiresAt: string | null;
    viewCount: number;
    maxViews: number | null;
}

// API functions
export const createPaste = async (data: CreatePasteRequest): Promise<CreatePasteResponse> => {
    const response = await api.post<CreatePasteResponse>('/pastes', data);
    return response.data;
};

export const getPaste = async (id: string): Promise<PasteApiResponse> => {
    const response = await api.get<PasteApiResponse>(`/pastes/${id}`);
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
