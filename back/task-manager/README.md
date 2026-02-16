# Task Manager Backend

Express + TypeScript REST API for Task Manager with Supabase integration, JWT auth middleware, validation, logging, and performance/security middleware.

## Features

- Authenticated task APIs (`/api/tasks`)
- Authenticated user profile APIs (`/api/users/me`)
- Password reset endpoints (`/api/auth/*`)
- Request logging + response-time tracking
- Helmet + CORS + validation + centralized error handling
- Compression + cache headers

## API Endpoints

### Health

| Method | Path      | Auth | Description  |
| ------ | --------- | ---- | ------------ |
| GET    | `/health` | No   | Health check |

### Tasks

| Method | Path                    | Auth | Description             |
| ------ | ----------------------- | ---- | ----------------------- |
| GET    | `/api/tasks`            | Yes  | List current user tasks |
| POST   | `/api/tasks`            | Yes  | Create task             |
| GET    | `/api/tasks/:id`        | Yes  | Get task by id          |
| PUT    | `/api/tasks/:id`        | Yes  | Update task             |
| PATCH  | `/api/tasks/:id/toggle` | Yes  | Toggle completed        |
| DELETE | `/api/tasks/:id`        | Yes  | Delete task             |

### Users

| Method | Path            | Auth | Description            |
| ------ | --------------- | ---- | ---------------------- |
| GET    | `/api/users/me` | Yes  | Get current profile    |
| PUT    | `/api/users/me` | Yes  | Update current profile |
| DELETE | `/api/users/me` | Yes  | Delete/disable account |

### Auth

| Method | Path                        | Auth               | Description      |
| ------ | --------------------------- | ------------------ | ---------------- |
| POST   | `/api/auth/forgot-password` | No                 | Send reset email |
| POST   | `/api/auth/reset-password`  | Yes (Bearer token) | Update password  |

## Environment Variables

Create `back/task-manager/.env`:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200,http://127.0.0.1:4200
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
FRONTEND_RESET_PASSWORD_URL=http://localhost:4200/reset-password
LOG_LEVEL=info
LOG_PRETTY=true
SLOW_QUERY_MS=200
```

## Setup

```bash
cd back/task-manager
npm install
npm run dev
```

Backend starts at `http://localhost:3000`.

## Usage Examples

Health check:

```bash
curl http://localhost:3000/health
```

Forgot password:

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

Get profile (requires JWT):

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <access_token>"
```

Create task (requires JWT):

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"title":"Write docs","description":"Update project README files"}'
```

## Scripts

| Command         | Description             |
| --------------- | ----------------------- |
| `npm run build` | Compile TypeScript      |
| `npm run watch` | Compile on file changes |
| `npm run exec`  | Run compiled JS         |
| `npm run fast`  | Build and execute       |
| `npm run dev`   | Nodemon dev mode        |
| `npm test`      | Run Jest tests          |

## Related Docs

- Root README: `../../README.md`
- Frontend README: `../../front/task-manager/README.md`
- Testing guide: `../../docs/TESTING.md`

## License

ISC
