# Task Manager Frontend

Angular 21 frontend for Task Manager, with Supabase authentication, protected routes, and task management UI.

## Features

- Authentication screens: login, register, forgot password, reset password
- Protected routes using `authGuard` and guest-only auth routes with `guestGuard`
- Task list and details pages with create/update/delete/toggle actions
- User profile page (`/me`)
- HTTP integration with backend APIs for tasks and auth

## Routes

| Route | Access | Description |
| --- | --- | --- |
| `/auth/login` | Guest | Login page |
| `/auth/register` | Guest | Register page |
| `/forgot-password` | Public | Request reset link |
| `/reset-password` | Public | Reset password page |
| `/tasks` | Auth | Tasks container |
| `/tasks/details/:id` | Auth | Task details |
| `/home` | Auth | Home dashboard |
| `/me` | Auth | User profile |

## Setup

```bash
cd front/task-manager
npm install
npm start
```

Frontend runs at `http://localhost:4200`.

### Backend API Configuration

File: `src/app/core/api-routes.ts`

```ts
export const apiRoutes = {
  tasksApi: 'http://localhost:3000/api',
  authForgotPassword: 'http://localhost:3000/api/auth/forgot-password',
  authResetPassword: 'http://localhost:3000/api/auth/reset-password',
};
```

## Installation Screenshots

![Frontend npm install](../../docs/screenshots/02-frontend-install.png)
![Frontend running](../../docs/screenshots/03-app-running.png)

## Usage Examples

### Example 1: Sign in and list tasks

1. Go to `http://localhost:4200/auth/login`.
2. Sign in with your Supabase user.
3. You are redirected to `/tasks` where your tasks are loaded.

### Example 2: Create a task

1. Open `/tasks`.
2. Fill in task form data.
3. Submit and verify the task appears in the list.

### Example 3: Password reset flow

1. Open `/forgot-password` and submit your email.
2. Open reset link from email.
3. Set a new password on `/reset-password`.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Angular dev server |
| `npm run build` | Production build |
| `npm run watch` | Build in watch mode |
| `npm test` | Run frontend tests |

## Testing

```bash
npm test
```

Test coverage includes auth service, auth interceptor, guards, tasks components, user profile, and shared UI specs.

## Related Docs

- Root README: `../../README.md`
- Backend README: `../../back/task-manager/README.md`
- Components doc: `./COMPONENTES.md`

## License

ISC
