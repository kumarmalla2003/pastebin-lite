import { Request, Response } from 'express';
import { createPaste, getPasteById, getAllPastes, deletePaste, cleanupExpiredPastes, incrementViewCount, CreatePasteInput } from '../models/paste';
import pool from '../utils/database';

// Helper to get current time (supports TEST_MODE with x-test-now-ms header)
const getCurrentTime = (req: Request): Date => {
    if (process.env.TEST_MODE === '1') {
        const testNowMs = req.headers['x-test-now-ms'];
        if (testNowMs && typeof testNowMs === 'string') {
            const ms = parseInt(testNowMs, 10);
            if (!isNaN(ms)) {
                return new Date(ms);
            }
        }
    }
    return new Date();
};

// POST /api/pastes - Create a new paste
export const handleCreatePaste = async (req: Request, res: Response): Promise<void> => {
    try {
        const { content, ttl_seconds, max_views } = req.body;

        // Validation per spec
        if (!content || typeof content !== 'string') {
            res.status(400).json({ error: 'content is required and must be a non-empty string' });
            return;
        }

        if (content.trim().length === 0) {
            res.status(400).json({ error: 'content cannot be empty' });
            return;
        }

        if (content.length > 500000) { // ~500KB limit
            res.status(400).json({ error: 'content exceeds maximum size (500KB)' });
            return;
        }

        // ttl_seconds validation: optional, must be integer >= 1
        if (ttl_seconds !== undefined) {
            if (typeof ttl_seconds !== 'number' || !Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
                return;
            }
        }

        // max_views validation: optional, must be integer >= 1
        if (max_views !== undefined) {
            if (typeof max_views !== 'number' || !Number.isInteger(max_views) || max_views < 1) {
                res.status(400).json({ error: 'max_views must be an integer >= 1' });
                return;
            }
        }

        const input: CreatePasteInput = {
            content: content.trim(),
            ttl_seconds,
            max_views
        };

        const paste = await createPaste(input);

        // Build the response URL per spec: /p/:id format
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        res.status(201).json({
            id: paste.id,
            url: `${baseUrl}/p/${paste.id}`
        });
    } catch (error) {
        console.error('Error creating paste:', error);
        res.status(500).json({ error: 'Failed to create paste' });
    }
};

// GET /api/pastes/:id - Get a paste by ID (increments view count per spec)
export const handleGetPaste = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const currentTime = getCurrentTime(req);

        // Get paste and increment view count atomically
        const paste = await getPasteById(id, currentTime, true);

        if (!paste) {
            res.status(404).json({ error: 'Paste not found' });
            return;
        }

        // Calculate remaining_views per spec
        // remaining_views = max_views - view_count (after increment)
        // If max_views is null (unlimited), remaining_views is null
        const remaining_views = paste.max_views !== null
            ? paste.max_views - paste.view_count
            : null;

        // Response per spec
        res.json({
            content: paste.content,
            remaining_views: remaining_views,
            expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
        });
    } catch (error) {
        console.error('Error getting paste:', error);
        res.status(500).json({ error: 'Failed to retrieve paste' });
    }
};

// POST /api/pastes/:id/view - Increment view count (for backwards compatibility)
export const handleIncrementViewCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await incrementViewCount(id);

        res.json({ success: true });
    } catch (error) {
        console.error('Error incrementing view count:', error);
        res.status(500).json({ error: 'Failed to increment view count' });
    }
};

// GET /api/pastes - Get all pastes
export const handleGetAllPastes = async (req: Request, res: Response): Promise<void> => {
    try {
        const pastes = await getAllPastes();

        res.json({
            pastes: pastes.map(paste => ({
                id: paste.id,
                title: paste.title,
                createdAt: paste.created_at,
                expiresAt: paste.expires_at,
                viewCount: paste.view_count,
                maxViews: paste.max_views
            }))
        });
    } catch (error) {
        console.error('Error getting pastes:', error);
        res.status(500).json({ error: 'Failed to retrieve pastes' });
    }
};

// DELETE /api/pastes/:id - Delete a paste
export const handleDeletePaste = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deleted = await deletePaste(id);

        if (!deleted) {
            res.status(404).json({ error: 'Paste not found' });
            return;
        }

        res.json({ success: true, message: 'Paste deleted' });
    } catch (error) {
        console.error('Error deleting paste:', error);
        res.status(500).json({ error: 'Failed to delete paste' });
    }
};

// DELETE /api/pastes - Delete all pastes
export const handleDeleteAllPastes = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('DELETE FROM pastes');
        const count = result.rowCount ?? 0;

        res.json({ success: true, message: `Deleted ${count} paste(s)` });
    } catch (error) {
        console.error('Error deleting all pastes:', error);
        res.status(500).json({ error: 'Failed to delete pastes' });
    }
};
