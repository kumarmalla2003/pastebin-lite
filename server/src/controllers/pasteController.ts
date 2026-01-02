import { Request, Response } from 'express';
import { createPaste, getPasteById, getAllPastes, deletePaste, cleanupExpiredPastes, incrementViewCount, CreatePasteInput } from '../models/paste';
import pool from '../utils/database';

// POST /api/pastes - Create a new paste
export const handleCreatePaste = async (req: Request, res: Response): Promise<void> => {
    try {
        const { content, title, expiresIn, maxViews } = req.body;

        // Validation
        if (!content || typeof content !== 'string') {
            res.status(400).json({ error: 'Content is required and must be a string' });
            return;
        }

        if (content.trim().length === 0) {
            res.status(400).json({ error: 'Content cannot be empty' });
            return;
        }

        if (content.length > 500000) { // ~500KB limit
            res.status(400).json({ error: 'Content exceeds maximum size (500KB)' });
            return;
        }

        if (title && title.length > 255) {
            res.status(400).json({ error: 'Title cannot exceed 255 characters' });
            return;
        }

        if (expiresIn !== undefined && (typeof expiresIn !== 'number' || expiresIn < 0)) {
            res.status(400).json({ error: 'expiresIn must be a positive number (seconds)' });
            return;
        }

        if (maxViews !== undefined && (typeof maxViews !== 'number' || maxViews < 1)) {
            res.status(400).json({ error: 'maxViews must be a positive integer' });
            return;
        }

        const input: CreatePasteInput = {
            content: content.trim(),
            title: title?.trim(),
            expiresIn,
            maxViews
        };

        const paste = await createPaste(input);

        // Build the response URL
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        res.status(201).json({
            id: paste.id,
            url: `${baseUrl}/${paste.id}`,
            title: paste.title,
            createdAt: paste.created_at,
            expiresAt: paste.expires_at,
            maxViews: paste.max_views
        });
    } catch (error) {
        console.error('Error creating paste:', error);
        res.status(500).json({ error: 'Failed to create paste' });
    }
};

// GET /api/pastes/:id - Get a paste by ID
export const handleGetPaste = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || id.length !== 8) {
            res.status(400).json({ error: 'Invalid paste ID' });
            return;
        }

        const paste = await getPasteById(id);

        if (!paste) {
            res.status(404).json({ error: 'Paste not found or has expired' });
            return;
        }

        res.json({
            id: paste.id,
            content: paste.content,
            title: paste.title,
            createdAt: paste.created_at,
            expiresAt: paste.expires_at,
            viewCount: paste.view_count,
            maxViews: paste.max_views
        });
    } catch (error) {
        console.error('Error getting paste:', error);
        res.status(500).json({ error: 'Failed to retrieve paste' });
    }
};

// POST /api/pastes/:id/view - Increment view count
export const handleIncrementViewCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || id.length !== 8) {
            res.status(400).json({ error: 'Invalid paste ID' });
            return;
        }

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
                viewCount: paste.view_count
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

        if (!id || id.length !== 8) {
            res.status(400).json({ error: 'Invalid paste ID' });
            return;
        }

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
