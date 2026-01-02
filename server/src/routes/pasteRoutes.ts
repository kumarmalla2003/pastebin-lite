import { Router } from 'express';
import { handleCreatePaste, handleGetPaste } from '../controllers/pasteController';

const router = Router();

// POST /api/pastes - Create a new paste
router.post('/', handleCreatePaste);

// GET /api/pastes/:id - Get a paste by ID
router.get('/:id', handleGetPaste);

export default router;
