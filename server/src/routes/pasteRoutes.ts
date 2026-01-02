import { Router } from 'express';
import { handleCreatePaste, handleGetPaste, handleGetAllPastes, handleDeletePaste, handleDeleteAllPastes, handleIncrementViewCount } from '../controllers/pasteController';

const router = Router();

// GET /api/pastes - Get all pastes (must be before /:id to avoid conflict)
router.get('/', handleGetAllPastes);

// POST /api/pastes - Create a new paste
router.post('/', handleCreatePaste);

// DELETE /api/pastes - Delete all pastes (must be before /:id)
router.delete('/', handleDeleteAllPastes);

// GET /api/pastes/:id - Get a paste by ID
router.get('/:id', handleGetPaste);

// POST /api/pastes/:id/view - Increment view count
router.post('/:id/view', handleIncrementViewCount);

// DELETE /api/pastes/:id - Delete a paste by ID
router.delete('/:id', handleDeletePaste);

export default router;
