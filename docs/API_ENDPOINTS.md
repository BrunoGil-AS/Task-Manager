# API Endpoints

This document covers the currently implemented backend API in `back/task-manager/src`.

## Base URL

- Local: `http://localhost:3000`
- API prefix: `/api`

## Authentication

- Protected endpoints require: `Authorization: Bearer <access_token>`
- Token is validated by `authenticateUser` middleware.

## Health

### `GET /health`

- Auth: No
- Description: Liveness check for the backend service.
- Success response:

```json
{
  "status": "OK"
}
```

## Tasks

All task routes are mounted under `/api/tasks` and are protected.

### `GET /api/tasks`

- Auth: Yes
- Description: Returns paginated tasks for the authenticated user.
- Query params:
  - `page` (number, default `1`)
  - `pageSize` (number, default `20`, max `100`)
  - `status` (`all` | `pending` | `completed`, default `all`)
  - `sortBy` (`createdAt` | `updatedAt` | `title`, default `createdAt`)
  - `sortOrder` (`asc` | `desc`, default `desc`)
- Success response:

```json
{
  "success": true,
  "data": [],
  "count": 0,
  "page": 1,
  "pageSize": 20
}
```

### `POST /api/tasks`

- Auth: Yes
- Description: Creates a task for the authenticated user.
- Request body:

```json
{
  "title": "Write docs",
  "description": "Document API and schema",
  "completed": false
}
```

- Success response: `201`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Write docs",
    "description": "Document API and schema",
    "completed": false,
    "owner_id": "user-uuid",
    "created_at": "2026-02-16T12:00:00.000Z",
    "updated_at": "2026-02-16T12:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

### `GET /api/tasks/:id`

- Auth: Yes
- Description: Returns one task by numeric id for the authenticated user.
- Success response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Write docs",
    "description": "Document API and schema",
    "completed": false,
    "owner_id": "user-uuid",
    "created_at": "2026-02-16T12:00:00.000Z",
    "updated_at": "2026-02-16T12:00:00.000Z"
  }
}
```

### `PUT /api/tasks/:id`

- Auth: Yes
- Description: Updates mutable fields on a task.
- Request body (all fields optional, at least one required):

```json
{
  "title": "Write complete docs",
  "description": "Include architecture diagrams",
  "completed": true
}
```

- Success response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Write complete docs",
    "description": "Include architecture diagrams",
    "completed": true
  },
  "message": "Task updated successfully"
}
```

### `PATCH /api/tasks/:id/toggle`

- Auth: Yes
- Description: Toggles `completed` for a task.
- Success response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "completed": true
  },
  "message": "Task status toggled"
}
```

### `DELETE /api/tasks/:id`

- Auth: Yes
- Description: Deletes a task owned by the authenticated user.
- Success response:

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Users

All user routes are mounted under `/api/users` and are protected.

### `GET /api/users/me`

- Auth: Yes
- Description: Returns current user profile.
- Success response:

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "Bruno"
  }
}
```

### `PUT /api/users/me`

- Auth: Yes
- Description: Updates current user profile.
- Request body:

```json
{
  "name": "Bruno Gil"
}
```

- Success response:

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "Bruno Gil"
  },
  "message": "User updated successfully"
}
```

### `DELETE /api/users/me`

- Auth: Yes
- Description: Disables current account (soft delete in service layer).
- Success response:

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "Bruno Gil"
  },
  "message": "User disabled successfully"
}
```

## Auth

Auth routes are mounted under `/api/auth`.

### `POST /api/auth/forgot-password`

- Auth: No
- Description: Requests password reset email via Supabase.
- Request body:

```json
{
  "email": "you@example.com"
}
```

- Success response:

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### `POST /api/auth/reset-password`

- Auth: Yes (Bearer recovery token)
- Description: Updates password using authenticated Supabase client.
- Request body:

```json
{
  "password": "new-password-123"
}
```

- Success response:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Common Error Shape

Controllers return one of these patterns depending on endpoint and branch:

```json
{
  "success": false,
  "error": "Error message"
}
```

or:

```json
{
  "error": "Error message"
}
```
