import pool from '../utils/database';
import { generatePasteId } from '../utils/generateId';

// TypeScript interfaces
export interface Paste {
    id: string;
    content: string;
    title: string | null;
    created_at: Date;
    expires_at: Date | null;
    max_views: number | null;
    view_count: number;
}

export interface CreatePasteInput {
    content: string;
    title?: string;
    expiresIn?: number; // seconds
    maxViews?: number;
}

// Create a new paste
export const createPaste = async (input: CreatePasteInput): Promise<Paste> => {
    const id = generatePasteId();
    const { content, title, expiresIn, maxViews } = input;

    // Calculate expiration time if provided
    let expiresAt: Date | null = null;
    if (expiresIn && expiresIn > 0) {
        expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    const query = `
    INSERT INTO pastes (id, content, title, expires_at, max_views)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

    const values = [id, content, title || null, expiresAt, maxViews || null];
    const result = await pool.query(query, values);

    return result.rows[0];
};

// Get a paste by ID (and increment view count)
export const getPasteById = async (id: string): Promise<Paste | null> => {
    // First, get the paste without incrementing
    const selectQuery = `SELECT * FROM pastes WHERE id = $1`;
    const selectResult = await pool.query(selectQuery, [id]);

    if (selectResult.rows.length === 0) {
        return null;
    }

    const paste = selectResult.rows[0] as Paste;

    // Check if paste has expired by time
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
        await deletePaste(id);
        return null;
    }

    // Check if paste has reached max views
    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
        await deletePaste(id);
        return null;
    }

    // Increment view count
    const updateQuery = `
    UPDATE pastes 
    SET view_count = view_count + 1 
    WHERE id = $1 
    RETURNING *
  `;
    const updateResult = await pool.query(updateQuery, [id]);

    return updateResult.rows[0];
};

// Delete a paste
export const deletePaste = async (id: string): Promise<boolean> => {
    const query = `DELETE FROM pastes WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};

// Clean up expired pastes (optional - for scheduled cleanup)
export const cleanupExpiredPastes = async (): Promise<number> => {
    const query = `
    DELETE FROM pastes 
    WHERE expires_at IS NOT NULL AND expires_at < NOW()
  `;
    const result = await pool.query(query);
    return result.rowCount ?? 0;
};
