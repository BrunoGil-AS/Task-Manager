# Notebook: Implementacion de Recuperacion de Contrasena

## 1. Objetivo exacto

Se implemento un flujo de password recovery con estas reglas:

- El usuario pide recuperacion desde frontend.
- El backend delega a Supabase el envio del email.
- Supabase redirige al frontend con token en `#fragment`.
- El frontend toma `access_token` del `fragment` y llama backend.
- El backend actualiza contrasena en Supabase usando ese token.

## 2. Contratos de API implementados

### `POST /api/auth/forgot-password`

- URL: `http://localhost:3000/api/auth/forgot-password`
- Body:

```json
{
  "email": "user@mail.com"
}
```

- Respuesta exito `200`:

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

- Respuesta error validacion `400`:

```json
{
  "success": false,
  "error": "Please provide a valid email address"
}
```

- Respuesta error servidor/Supabase `500`:

```json
{
  "success": false,
  "error": "..."
}
```

### `POST /api/auth/reset-password`

- URL: `http://localhost:3000/api/auth/reset-password`
- Header requerido:

```http
Authorization: Bearer <recovery_access_token>
```

- Body:

```json
{
  "password": "newPassword123"
}
```

- Respuesta exito `200`:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

- Respuesta token invalido/expirado `401`:

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

- Respuesta password invalida `400`:

```json
{
  "success": false,
  "error": "Password must be at least 6 characters long"
}
```

## 3. Flujo tecnico implementado (paso a paso)

1. Login muestra link `Forgot password?`.
2. Usuario entra a `/forgot-password`.
3. Componente valida email y usa `AuthService.requestPasswordReset(email)`.
4. `AuthService` llama backend `POST /api/auth/forgot-password`.
5. Backend ejecuta `supabase.auth.resetPasswordForEmail` con `redirectTo`.
6. Email de Supabase redirige a:
   - `http://localhost:4200/reset-password#access_token=...&type=recovery`
7. `ResetPasswordComponent` usa `ActivatedRoute.fragment`.
8. Si encuentra `#error=...`, muestra mensaje user-friendly.
9. Si encuentra `#access_token=...`, habilita submit de nueva password.
10. `AuthService.resetPassword(token, newPassword)` llama backend.
11. Backend usa `createAuthenticatedClient(token).auth.updateUser({ password })`.
12. En exito, frontend redirige a `/auth/login` y muestra mensaje final.

## 4. Detalle por archivo creado (que hace cada uno)

### Backend

- [`back/task-manager/src/auth/controllers/authController.ts`](../back/task-manager/src/auth/controllers/authController.ts)
  - Crea `AuthController`.
  - Metodo `requestPasswordReset`.
  - Metodo `updatePassword`.
  - Validaciones:
    - Email con regex.
    - Password minima de 6.
  - Manejo de errores por status (`400`, `401`, `500`).
  - Config fallback redirect: `http://localhost:4200/reset-password`.

- [`back/task-manager/src/auth/routes/authRoutes.ts`](../back/task-manager/src/auth/routes/authRoutes.ts)
  - Registra:
    - `POST /forgot-password`
    - `POST /reset-password` + `authenticateUser`

- [`back/task-manager/src/auth/controllers/authController.test.ts`](../back/task-manager/src/auth/controllers/authController.test.ts)
  - Cubre:
    - Email invalido.
    - Envio exitoso de recovery email.
    - Error Supabase al pedir recovery.
    - Password corta.
    - Password update exitoso.
    - Token invalido en update.

### Frontend

- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.ts`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.ts)
  - Form reactive con email.
  - Validaciones: required + email.
  - Estados: loading/error/success.
  - Submit a `AuthService.requestPasswordReset`.

- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.html`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.html)
  - UI del formulario y mensajes.
  - Boton disabled con loading.
  - Link de regreso a login.

- [`front/task-manager/src/app/pages/forgot-password/forgot-password.component.css`](../front/task-manager/src/app/pages/forgot-password/forgot-password.component.css)
  - Estilos base de tarjeta, errores y exito.

- [`front/task-manager/src/app/pages/reset-password/reset-password.component.ts`](../front/task-manager/src/app/pages/reset-password/reset-password.component.ts)
  - Lee `this.route.fragment`.
  - Parsea con `URLSearchParams`.
  - Soporta:
    - `#error=...` / `error_code=otp_expired`
    - `#access_token=...`
  - Form reactive con:
    - `password` (min 6)
    - `confirmPassword`
    - validador custom `passwordMismatch`
  - Submit a `AuthService.resetPassword(token, password)`.
  - Guarda mensaje en `sessionStorage` y redirige a login.

- [`front/task-manager/src/app/pages/reset-password/reset-password.component.html`](../front/task-manager/src/app/pages/reset-password/reset-password.component.html)
  - Render condicional para error de hash vs formulario.
  - Mensajes de error para cada campo y mismatch.

- [`front/task-manager/src/app/pages/reset-password/reset-password.component.css`](../front/task-manager/src/app/pages/reset-password/reset-password.component.css)
  - Estilos visuales del flujo de reset.

## 5. Detalle por archivo modificado (cambio puntual)

- [`back/task-manager/src/app.ts`](../back/task-manager/src/app.ts)
  - Se monto `app.use("/api/auth", authRouter)`.

- [`front/task-manager/src/app/core/api-routes.ts`](../front/task-manager/src/app/core/api-routes.ts)
  - Se agregaron:
    - `authForgotPassword`
    - `authResetPassword`

- [`front/task-manager/src/app/auth/auth.service.ts`](../front/task-manager/src/app/auth/auth.service.ts)
  - Nuevos metodos:
    - `requestPasswordReset(email)`
    - `resetPassword(token, newPassword)`
  - Ambos llaman backend via `HttpClient`.

- [`front/task-manager/src/app/auth/auth.service.spec.ts`](../front/task-manager/src/app/auth/auth.service.spec.ts)
  - Migro a `HttpClientTestingModule`.
  - Nuevos tests:
    - llamada a `/api/auth/forgot-password`
    - llamada a `/api/auth/reset-password`
    - assert de header `Authorization: Bearer <token>`

- [`front/task-manager/src/app/auth/auth.interceptor.ts`](../front/task-manager/src/app/auth/auth.interceptor.ts)
  - Cambio clave:
    - Si request ya trae `Authorization`, no lo sobreescribe.
  - Esto evita reemplazar token de recovery por token de sesion.

- [`front/task-manager/src/app/app.routes.ts`](../front/task-manager/src/app/app.routes.ts)
  - Se agregaron rutas:
    - `/forgot-password`
    - `/reset-password`
  - Se agrego redirect `/login -> /auth/login`.

- [`front/task-manager/src/app/auth/login/login.ts`](../front/task-manager/src/app/auth/login/login.ts)
  - Lee `passwordResetSuccess` de `sessionStorage`.
  - Limpia la key despues de mostrarla.

- [`front/task-manager/src/app/auth/login/login.html`](../front/task-manager/src/app/auth/login/login.html)
  - Se agrego link `Forgot password?`.
  - Se agrego mensaje de exito post-reset.

- [`front/task-manager/src/app/auth/login/login.css`](../front/task-manager/src/app/auth/login/login.css)
  - Nuevo estilo `.success-message`.

## 6. Validaciones y errores cubiertos

### Backend

- Email mal formado.
- Password menor a 6.
- Token ausente/invalido/expirado.
- Error de Supabase.
- Excepcion no controlada.

### Frontend

- Email required + formato.
- Password required + minLength.
- Confirm password required + mismatch.
- Fragment con error (`#error=...`).
- `otp_expired`.
- Fragment sin `access_token`.
- Errores HTTP y mensajes amigables.

## 7. Configuracion requerida en Supabase

- `Site URL` configurada.
- `Redirect URLs` incluyendo:
  - `http://localhost:4200/reset-password`
- Para backend:
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
- Opcional para backend:
  - `FRONTEND_RESET_PASSWORD_URL`

## 8. Comandos ejecutados para verificar

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

## 9. Lista rapida de accesos directos

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
