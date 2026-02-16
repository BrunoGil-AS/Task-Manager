# API Error Codes

Error codes and status responses currently used by Task Manager backend controllers and middleware.

## Standard HTTP Status Codes

| Status | Code | Meaning | Typical Source |
| --- | --- | --- | --- |
| 400 | `BAD_REQUEST` | Invalid payload or parameters | Controller input validation |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired token | `authenticateUser`, auth reset endpoint |
| 403 | `FORBIDDEN` | Reserved for permission denial | Not currently returned explicitly by controllers |
| 404 | `NOT_FOUND` | Route/resource not found | Task by id not found, app fallback |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected backend or provider failure | Catch blocks and external API failures |

## Endpoint-Specific Error Cases

## Tasks

### `GET /api/tasks`

- `401 UNAUTHORIZED`: no bearer token or invalid session.
- `500 INTERNAL_SERVER_ERROR`: task service failure.

### `GET /api/tasks/:id`

- `400 BAD_REQUEST`: non-numeric id.
- `401 UNAUTHORIZED`: missing/invalid token.
- `404 NOT_FOUND`: task not found for current user.
- `500 INTERNAL_SERVER_ERROR`: service failure.

### `POST /api/tasks`

- `400 BAD_REQUEST`: missing/empty title.
- `401 UNAUTHORIZED`: missing/invalid token.
- `500 INTERNAL_SERVER_ERROR`: create failure.

### `PUT /api/tasks/:id`

- `400 BAD_REQUEST`: invalid id or empty update payload.
- `401 UNAUTHORIZED`: missing/invalid token.
- `404 NOT_FOUND`: task not found.
- `500 INTERNAL_SERVER_ERROR`: update failure.

### `PATCH /api/tasks/:id/toggle`

- `400 BAD_REQUEST`: invalid id.
- `401 UNAUTHORIZED`: missing/invalid token.
- `404 NOT_FOUND`: task not found.
- `500 INTERNAL_SERVER_ERROR`: toggle failure.

### `DELETE /api/tasks/:id`

- `400 BAD_REQUEST`: invalid id.
- `401 UNAUTHORIZED`: missing/invalid token.
- `500 INTERNAL_SERVER_ERROR`: delete failure.

## Users

### `GET /api/users/me`

- `401 UNAUTHORIZED`: access denied.
- `500 INTERNAL_SERVER_ERROR`: profile lookup failure.

### `PUT /api/users/me`

- `400 BAD_REQUEST`: missing/empty name.
- `401 UNAUTHORIZED`: access denied.
- `500 INTERNAL_SERVER_ERROR`: update failure.

### `DELETE /api/users/me`

- `401 UNAUTHORIZED`: access denied.
- `500 INTERNAL_SERVER_ERROR`: disable/delete failure.

## Auth

### `POST /api/auth/forgot-password`

- `400 BAD_REQUEST`: invalid email format.
- `500 INTERNAL_SERVER_ERROR`: provider reset-email failure.

### `POST /api/auth/reset-password`

- `400 BAD_REQUEST`: password too short or provider validation issue.
- `401 UNAUTHORIZED`: invalid or expired recovery token.
- `500 INTERNAL_SERVER_ERROR`: unexpected provider failure.

## Middleware-Level Errors

### `authenticateUser` (`back/task-manager/src/middleware/auth.ts`)

- `401 UNAUTHORIZED`
  - Missing `Authorization` header.
  - Header does not start with `Bearer`.
  - Supabase token verification fails.

## Canonical Error Shapes

Controllers currently emit one of these forms:

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
