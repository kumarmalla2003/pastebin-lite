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
    ttl_seconds?: number;  // Changed from expiresIn to match spec
    max_views?: number;    // Changed from maxViews to match spec
}

// Create a new paste
export const createPaste = async (input: CreatePasteInput): Promise<Paste> => {
    const id = generatePasteId();
    const { content, title, ttl_seconds, max_views } = input;

    // Calculate expiration time if provided
    let expiresAt: Date | null = null;
    if (ttl_seconds && ttl_seconds > 0) {
        expiresAt = new Date(Date.now() + ttl_seconds * 1000);
    }

    const query = `
    INSERT INTO pastes (id, content, title, expires_at, max_views)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

    const values = [id, content, title || null, expiresAt, max_views || null];
    const result = await pool.query(query, values);

    return result.rows[0];
};

// Get a paste by ID with optional view increment
// currentTime is used to check expiry (supports TEST_MODE with x-test-now-ms header)
// incrementView controls whether to increment the view count (for API fetches)
export const getPasteById = async (
    id: string,
    currentTime: Date = new Date(),
    incrementView: boolean = false
): Promise<Paste | null> => {
    // Use a transaction for atomic read + increment
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get the paste
        const selectQuery = `SELECT * FROM pastes WHERE id = $1 FOR UPDATE`;
        const selectResult = await client.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        const paste = selectResult.rows[0] as Paste;

        // Check if paste has expired by time
        if (paste.expires_at && new Date(paste.expires_at) <= currentTime) {
            // Delete the expired paste
            await client.query(`DELETE FROM pastes WHERE id = $1`, [id]);
            await client.query('COMMIT');
            return null;
        }

        // Check if paste has reached max views BEFORE incrementing
        if (paste.max_views !== null && paste.view_count >= paste.max_views) {
            // Delete the paste that exceeded views
            await client.query(`DELETE FROM pastes WHERE id = $1`, [id]);
            await client.query('COMMIT');
            return null;
        }

        // Increment view count if requested (for API/HTML fetches)
        if (incrementView) {
            const updateQuery = `
                UPDATE pastes 
                SET view_count = view_count + 1 
                WHERE id = $1
                RETURNING *
            `;
            const updateResult = await client.query(updateQuery, [id]);
            await client.query('COMMIT');
            return updateResult.rows[0] as Paste;
        }

        await client.query('COMMIT');
        return paste;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Increment view count (standalone - for backwards compatibility)
export const incrementViewCount = async (id: string): Promise<void> => {
    const selectQuery = `SELECT * FROM pastes WHERE id = $1`;
    const result = await pool.query(selectQuery, [id]);

    if (result.rows.length === 0) {
        console.log(`[IncrementView] Paste ${id} not found`);
        return;
    }

    const paste = result.rows[0] as Paste;

    // Check if paste has reached max views
    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
        console.log(`[IncrementView] Max views reached for ${id}, deleting`);
        await deletePaste(id);
        return;
    }

    // Increment view count
    const updateQuery = `
    UPDATE pastes 
    SET view_count = view_count + 1 
    WHERE id = $1
  `;
    await pool.query(updateQuery, [id]);
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

// Get all pastes (for listing)
export const getAllPastes = async (): Promise<Paste[]> => {
    // First clean up expired pastes
    await cleanupExpiredPastes();

    const query = `
    SELECT id, title, created_at, expires_at, view_count, max_views 
    FROM pastes 
    ORDER BY created_at DESC
    LIMIT 50
  `;
    const result = await pool.query(query);
    return result.rows;
};
