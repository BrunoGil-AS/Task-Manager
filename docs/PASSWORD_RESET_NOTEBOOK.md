# Notebook: Password Recovery Implementation

## 1. Exact objective

A password recovery flow was implemented with these rules:

- The user requests recovery from the frontend.
- The backend delegates email delivery to Supabase.
- Supabase redirects to the frontend with token data in `#fragment`.
- The frontend reads `access_token` from the fragment and calls backend.
- The backend updates the password in Supabase using that token.

## 2. Implemented API contracts

### `POST /api/auth/forgot-password`

- URL: `http://localhost:3000/api/auth/forgot-password`
- Body:

```json
{
  "email": "user@mail.com"
}
```

- Success response `200`:

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

- Validation error response `400`:

```json
{
  "success": false,
  "error": "Please provide a valid email address"
}
```

- Server/Supabase error response `500`:

```json
{
  "success": false,
  "error": "..."
}
```

### `POST /api/auth/reset-password`

- URL: `http://localhost:3000/api/auth/reset-password`
- Required header:

```http
Authorization: Bearer <recovery_access_token>
```

- Body:

```json
{
  "password": "newPassword123"
}
```

- Success response `200`:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

- Invalid/expired token response `401`:

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

- Invalid password response `400`:

```json
{
  "success": false,
  "error": "Password must be at least 6 characters long"
}
```

## 3. Implemented technical flow (step by step)

1. Login shows `Forgot password?` link.
2. User navigates to `/forgot-password`.
3. Component validates email and calls `AuthService.requestPasswordReset(email)`.
4. `AuthService` calls backend `POST /api/auth/forgot-password`.
5. Backend runs `supabase.auth.resetPasswordForEmail` with `redirectTo`.
6. Supabase email redirects to:
   - `http://localhost:4200/reset-password#access_token=...&type=recovery`
7. `ResetPasswordComponent` reads `ActivatedRoute.fragment`.
8. If `#error=...` exists, it shows a user-friendly message.
9. If `#access_token=...` exists, new password submission is enabled.
10. `AuthService.resetPassword(token, newPassword)` calls backend.
11. Backend uses `createAuthenticatedClient(token).auth.updateUser({ password })`.
12. On success, frontend redirects to `/auth/login` and shows final message.

## 4. File-by-file detail (what each one does)

### Backend

- [`back/task-manager/src/auth/controllers/authController.ts`](../back/task-manager/src/auth/controllers/authController.ts)
  - Defines `AuthController`.
  - Method `requestPasswordReset`.
  - Method `updatePassword`.
  - Validations:
    - Email regex.
    - Minimum password length of 6.
  - Error handling by status (`400`, `401`, `500`).
  - Fallback redirect config: `http://localhost:4200/reset-password`.

- [`back/task-manager/src/auth/routes/authRoutes.ts`](../back/task-manager/src/auth/routes/authRoutes.ts)
  - Registers:
    - `POST /forgot-password`
    - `POST /reset-password` + `authenticateUser`

- [`back/task-manager/src/auth/controllers/authController.test.ts`](../back/task-manager/src/auth/controllers/authController.test.ts)
  - Covers:
    - Invalid email.
    - Successful recovery email send.
    - Supabase error in recovery request.
    - Short password.
    - Successful password update.
    - Invalid token during update.

### Frontend

- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.ts`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.ts)
  - Reactive email form.
  - Validations: required + email.
  - States: loading/error/success.
  - Submit to `AuthService.requestPasswordReset`.

- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.html`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.html)
  - Form and messages UI.
  - Disabled button while loading.
  - Link back to login.

- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.css`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.css)
  - Base card, error, and success styles.

- [`front/task-manager/src/app/pages/reset-password/reset-password.component.ts`](../front/task-manager/src/app/pages/reset-password/reset-password.component.ts)
  - Reads `this.route.fragment`.
  - Parses with `URLSearchParams`.
  - Supports:
    - `#error=...` / `error_code=otp_expired`
    - `#access_token=...`
  - Reactive form with:
    - `password` (min 6)
    - `confirmPassword`
    - custom validator `passwordMismatch`
  - Submit to `AuthService.resetPassword(token, password)`.
  - Stores success message in `sessionStorage` and redirects to login.

- [`front/task-manager/src/app/pages/reset-password/reset-password.component.html`](../front/task-manager/src/app/pages/reset-password/reset-password.component.html)
  - Conditional render for hash errors vs form.
  - Error messages for each field and mismatch.

- [`front/task-manager/src/app/pages/reset-password/reset-password.component.css`](../front/task-manager/src/app/pages/reset-password/reset-password.component.css)
  - Reset flow visual styles.

## 5. File-by-file modified changes (specific)

- [`back/task-manager/src/app.ts`](../back/task-manager/src/app.ts)
  - Added `app.use("/api/auth", authRouter)`.

- [`front/task-manager/src/app/core/api-routes.ts`](../front/task-manager/src/app/core/api-routes.ts)
  - Added:
    - `authForgotPassword`
    - `authResetPassword`

- [`front/task-manager/src/app/auth/auth.service.ts`](../front/task-manager/src/app/auth/auth.service.ts)
  - New methods:
    - `requestPasswordReset(email)`
    - `resetPassword(token, newPassword)`
  - Both call backend via `HttpClient`.

- [`front/task-manager/src/app/auth/auth.service.spec.ts`](../front/task-manager/src/app/auth/auth.service.spec.ts)
  - Migrated to `HttpClientTestingModule`.
  - New tests:
    - call to `/api/auth/forgot-password`
    - call to `/api/auth/reset-password`
    - assert header `Authorization: Bearer <token>`

- [`front/task-manager/src/app/auth/auth.interceptor.ts`](../front/task-manager/src/app/auth/auth.interceptor.ts)
  - Key change:
    - If request already has `Authorization`, do not overwrite it.
  - Prevents replacing recovery token with session token.

- [`front/task-manager/src/app/app.routes.ts`](../front/task-manager/src/app/app.routes.ts)
  - Added routes:
    - `/forgot-password`
    - `/reset-password`
  - Added redirect `/login -> /auth/login`.

- [`front/task-manager/src/app/auth/login/login.ts`](../front/task-manager/src/app/auth/login/login.ts)
  - Reads `passwordResetSuccess` from `sessionStorage`.
  - Removes key after showing message.

- [`front/task-manager/src/app/auth/login/login.html`](../front/task-manager/src/app/auth/login/login.html)
  - Added `Forgot password?` link.
  - Added post-reset success message.

- [`front/task-manager/src/app/auth/login/login.css`](../front/task-manager/src/app/auth/login/login.css)
  - New `.success-message` style.

## 6. Covered validations and errors

### Backend

- Malformed email.
- Password shorter than 6.
- Missing/invalid/expired token.
- Supabase error.
- Unhandled exception.

### Frontend

- Required + format email validation.
- Required + minLength password validation.
- Required confirm password + mismatch.
- Fragment with error (`#error=...`).
- `otp_expired`.
- Fragment without `access_token`.
- HTTP errors with user-friendly messages.

## 7. Required Supabase configuration

- `Site URL` configured.
- `Redirect URLs` including:
  - `http://localhost:4200/reset-password`
- For backend:
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
- Optional for backend:
  - `FRONTEND_RESET_PASSWORD_URL`

## 8. Commands executed for verification

### Backend

```bash
npm run build
npm test
npm test -- src/auth/controllers/authController.test.ts
```

### Frontend

```bash
npm run build
npm test -- --watch=false --include='src/app/auth/auth.service.spec.ts'
```

## 9. Quick links

- [`back/task-manager/src/auth/controllers/authController.ts`](../back/task-manager/src/auth/controllers/authController.ts)
- [`back/task-manager/src/auth/routes/authRoutes.ts`](../back/task-manager/src/auth/routes/authRoutes.ts)
- [`back/task-manager/src/auth/controllers/authController.test.ts`](../back/task-manager/src/auth/controllers/authController.test.ts)
- [`back/task-manager/src/app.ts`](../back/task-manager/src/app.ts)
- [`front/task-manager/src/app/auth/auth.service.ts`](../front/task-manager/src/app/auth/auth.service.ts)
- [`front/task-manager/src/app/auth/auth.interceptor.ts`](../front/task-manager/src/app/auth/auth.interceptor.ts)
- [`front/task-manager/src/app/auth/auth.service.spec.ts`](../front/task-manager/src/app/auth/auth.service.spec.ts)
- [`front/task-manager/src/app/app.routes.ts`](../front/task-manager/src/app/app.routes.ts)
- [`front/task-manager/src/app/core/api-routes.ts`](../front/task-manager/src/app/core/api-routes.ts)
- [`front/task-manager/src/app/auth/login/login.ts`](../front/task-manager/src/app/auth/login/login.ts)
- [`front/task-manager/src/app/auth/login/login.html`](../front/task-manager/src/app/auth/login/login.html)
- [`front/task-manager/src/app/auth/login/login.css`](../front/task-manager/src/app/auth/login/login.css)
- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.ts`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.ts)
- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.html`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.html)
- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.css`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.css)
- [`front/task-manager/src/app/pages/reset-password/reset-password.component.ts`](../front/task-manager/src/app/pages/reset-password/reset-password.component.ts)
- [`front/task-manager/src/app/pages/reset-password/reset-password.component.html`](../front/task-manager/src/app/pages/reset-password/reset-password.component.html)
- [`front/task-manager/src/app/pages/reset-password/reset-password.component.css`](../front/task-manager/src/app/pages/reset-password/reset-password.component.css)
