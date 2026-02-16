# Environment Variables

This project has backend runtime environment variables and frontend environment configuration.

## Backend (`back/task-manager/.env`)

These values are read from `process.env` in backend source files.

| Variable | Required | Default | Used In | Description |
| --- | --- | --- | --- | --- |
| `PORT` | No | `3000` | `back/task-manager/src/index.ts` | HTTP port for Express server. |
| `CORS_ORIGIN` | No | `http://localhost:4200,http://127.0.0.1:4200` | `back/task-manager/src/app.ts` | Comma-separated allowed browser origins. |
| `SUPABASE_URL` | Yes | None | `back/task-manager/src/config/supabaseClient.ts` | Supabase project URL used to initialize clients. |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | None | `back/task-manager/src/config/supabaseClient.ts` | Supabase publishable key used by backend client. |
| `FRONTEND_RESET_PASSWORD_URL` | No | `http://localhost:4200/reset-password` | `back/task-manager/src/auth/controllers/authController.ts` | Redirect URL for password reset emails. |
| `LOG_LEVEL` | No | `info` | `back/task-manager/src/config/logger.ts` | Pino log level (`debug`, `info`, `warn`, `error`). |
| `LOG_PRETTY` | No | `false` | `back/task-manager/src/config/logger.ts` | Enables pretty-printed logs when `true`. |
| `SLOW_QUERY_MS` | No | `200` | `back/task-manager/src/tasks/services/taskService.ts` | Threshold for slow-query warning logs. |

### Example backend `.env`

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

## Frontend (`front/task-manager/src/app/core/environment.ts`)

The frontend uses a TypeScript environment object rather than runtime `.env` variables.

| Field | Required | Example | Used In | Description |
| --- | --- | --- | --- | --- |
| `production` | Yes | `false` | Angular config/build | Build/runtime mode flag. |
| `supabaseUrl` | Yes | `https://your-project.supabase.co` | `front/task-manager/src/app/supabase/supabase.service.ts` | Supabase URL for browser client. |
| `supabaseKey` | Yes | `sb_publishable_xxx` | `front/task-manager/src/app/supabase/supabase.service.ts` | Supabase publishable key for browser client. |
| `backendUrl` | Yes | `http://localhost:3000` | Routing/config references | Base backend URL for local environment. |

## Frontend API Route Constants

These are fixed constants and not environment variables:

File: `front/task-manager/src/app/core/api-routes.ts`

```ts
export const apiRoutes = {
  tasksApi: 'http://localhost:3000/api',
  authForgotPassword: 'http://localhost:3000/api/auth/forgot-password',
  authResetPassword: 'http://localhost:3000/api/auth/reset-password',
};
```
