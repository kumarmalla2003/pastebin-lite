import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pasteRoutes from './routes/pasteRoutes';
import pool from './utils/database';
import { getPasteById, incrementViewCount } from './models/paste';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Helper to escape HTML for safe rendering
const escapeHtml = (text: string): string => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Helper to get current time (supports TEST_MODE with x-test-now-ms header)
export const getCurrentTime = (req: Request): Date => {
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

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'x-test-now-ms']
}));
app.use(express.json({ limit: '1mb' }));

// Health check route - GET /api/healthz
app.get('/api/healthz', async (req: Request, res: Response) => {
    try {
        // Check database connectivity
        await pool.query('SELECT 1');
        res.json({ ok: true });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({ ok: false, error: 'Database connection failed' });
    }
});

// Routes
app.use('/api/pastes', pasteRoutes);

// HTML paste view route - GET /p/:id
app.get('/p/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currentTime = getCurrentTime(req);

        // Get paste and increment view count atomically
        const paste = await getPasteById(id, currentTime, true);

        if (!paste) {
            res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paste Not Found</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
        .container { text-align: center; padding: 2rem; }
        h1 { color: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <h1>404 - Paste Not Found</h1>
        <p>This paste may have expired or reached its view limit.</p>
        <a href="/">Create a new paste</a>
    </div>
</body>
</html>`);
            return;
        }

        // Render paste content safely (escaped HTML)
        const escapedContent = escapeHtml(paste.content);
        const escapedTitle = paste.title ? escapeHtml(paste.title) : 'Untitled Paste';

        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapedTitle} - Pastebin Lite</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: #eee; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: #00d9ff; margin-bottom: 0.5rem; }
        .meta { color: #888; font-size: 0.875rem; margin-bottom: 1rem; }
        pre { background: #16213e; padding: 1rem; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
        code { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.9rem; }
        a { color: #00d9ff; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${escapedTitle}</h1>
        <div class="meta">
            Created: ${new Date(paste.created_at).toLocaleString()}
            ${paste.expires_at ? ` | Expires: ${new Date(paste.expires_at).toLocaleString()}` : ''}
            ${paste.max_views ? ` | Views: ${paste.view_count}/${paste.max_views}` : ''}
        </div>
        <pre><code>${escapedContent}</code></pre>
        <p><a href="/">← Create a new paste</a></p>
    </div>
</body>
</html>`);
    } catch (error) {
        console.error('Error fetching paste for HTML view:', error);
        res.status(500).send('Internal Server Error');
    }
});

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
