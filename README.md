# Pastebin-Lite

A lightweight Pastebin clone where users can create text pastes and share them via unique URLs.

## Features

- Create text pastes with arbitrary content
- Generate shareable URLs for each paste (`/p/:id` format)
- Optional time-based expiration (TTL in seconds)
- Optional view-count limit
- Pastes become unavailable when constraints are triggered
- HTML view for pastes with safe content rendering
- REST API with JSON responses

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL database (or hosted PostgreSQL like Neon)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kumarmalla2003/pastebin-lite.git
   cd pastebin-lite
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Create a `.env` file in the `server` directory:
   ```
   DATABASE_URL=your_postgresql_connection_string
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   TEST_MODE=0
   ```
   
   > Set `TEST_MODE=1` to enable deterministic expiry testing with `x-test-now-ms` header.

4. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

5. Start the development servers:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

6. Open http://localhost:5173 in your browser.

## Persistence Layer

**PostgreSQL** is used as the persistence layer. The database stores pastes with the following schema:

```sql
CREATE TABLE pastes (
    id VARCHAR(8) PRIMARY KEY,
    content TEXT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0
);
```

For deployment, a hosted PostgreSQL database (Neon) is used to ensure data persists across serverless function invocations and server restarts.

## Design Decisions

1. **Separate Frontend/Backend Deployment**: The frontend (React/Vite) is deployed on Vercel, while the backend (Express) is deployed on Render. This allows each to scale independently and use platform-optimized hosting.

2. **HTML Route for Paste Viewing**: The backend serves an HTML page at `/p/:id` for direct paste viewing in browsers, with safe HTML escaping to prevent XSS attacks.

3. **Atomic View Counting**: View counts are incremented atomically within database transactions to ensure accuracy under concurrent load.

4. **TEST_MODE Support**: When `TEST_MODE=1`, the server respects the `x-test-now-ms` header for deterministic expiry testing.

5. **Short Unique IDs**: Paste IDs are 8-character alphanumeric strings generated using nanoid for URL-friendliness.

6. **Expiration Logic**: Pastes are checked for expiration on access. Expired or view-limit-exceeded pastes return 404.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check (returns `{ "ok": true }`) |
| POST | `/api/pastes` | Create a new paste |
| GET | `/api/pastes/:id` | Fetch paste by ID (increments view count) |
| GET | `/p/:id` | View paste as HTML |

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon)

## License

MIT