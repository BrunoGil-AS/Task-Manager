# Task Manager

Full-stack task management application with Angular 21 (frontend), Express + TypeScript (backend), and Supabase (database + auth).

## Overview

Task Manager includes:

- User authentication (sign up, sign in, forgot/reset password)
- Task CRUD (create, read, update, delete, toggle complete)
- User profile management
- Protected frontend routes with auth guards
- Backend validation, centralized errors, logging, compression, and cache headers

## Tech Stack

- Frontend: Angular 21, TypeScript, RxJS, Supabase JS
- Backend: Express 5, TypeScript, Zod, Jose, Supabase JS
- Database/Auth: Supabase PostgreSQL + Supabase Auth
- Testing: Vitest (frontend), Jest (backend)

## Repository Layout

```text
Task Manager/
|- back/task-manager/          # Backend API
|- front/task-manager/         # Angular frontend
|- docs/                       # Support docs
|  |- TESTING.md
|  |- support_auth.md
|  |- support_material.md
|  '- screenshots/             # Installation screenshot references
'- TODO.md
```

## Quick Start

### 1) Backend

```bash
cd back/task-manager
npm install
```

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

Run backend:

```bash
npm run dev
```

Backend URL: `http://localhost:3000`

### 2) Frontend

```bash
cd front/task-manager
npm install
npm start
```

Frontend URL: `http://localhost:4200`

## Usage Examples

### UI Flow

1. Open `http://localhost:4200/auth/login`.
2. Register a new user at `http://localhost:4200/auth/register`.
3. Log in and create tasks from `http://localhost:4200/tasks`.
4. Open task details at `http://localhost:4200/tasks/details/:id`.
5. Manage your profile at `http://localhost:4200/me`.

### API Examples

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

Get tasks (requires JWT):

```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <access_token>"
```

## API Summary

- Tasks: `/api/tasks` (GET, POST, GET by id, PUT, PATCH toggle, DELETE)
- Users: `/api/users/me` (GET, PUT, DELETE)
- Auth: `/api/auth/forgot-password`, `/api/auth/reset-password`
- Health: `/health`

## Testing

Backend:

```bash
cd back/task-manager
npm test
```

Frontend:

```bash
cd front/task-manager
npm test
```

Detailed guidance: `docs/TESTING.md`.

## Additional Docs

- Backend details: `back/task-manager/README.md`
- Frontend details: `front/task-manager/README.md`
- Components: `front/task-manager/COMPONENTES.md`
- Auth support: `docs/support_auth.md`
- Support material: `docs/support_material.md`

## License

ISC
