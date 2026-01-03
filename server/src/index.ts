import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pasteRoutes from './routes/pasteRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    const clientDistPath = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDistPath));

    // Handle React routing (SPA fallback) - must be AFTER API routes
    // We'll wrap this in a function to be called after routes are defined
}

// Routes
app.use('/api/pastes', pasteRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA Fallback for production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
        // Skip API routes (they should have been matched already or fall through to 404)
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
}

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
