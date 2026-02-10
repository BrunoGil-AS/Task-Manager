# Security Audit (Frontend)

Date: 2026-02-10

## Scope

- Angular frontend configuration and client-side auth/storage.

## Changes Applied

- Dev server security headers added in `front/task-manager/angular.json`.
- CSP configured to restrict sources while allowing required fonts and API calls.
  - `default-src` **'self'** - By default, only allows resources from the same source
  - `script-src` **'self'** - Only scripts from the same domain
  - `style-src` **'self'** 'unsafe-inline' <https://fonts.googleapis.com> - Custom styles, inline styles (for Angular), and Google Fonts
  - `font-src` **'self'** <https://fonts.gstatic.com> data: - Custom fonts, Google fonts, and data URIs
  - `img-src` **'self'** data: - Custom images and data URIs
  - `connect-src` **'self'** <http://localhost:3000> <https://dvyjtwsauondclauycvi.supabase.co> - Allows API connections to localhost and Supabase
  - `frame-ancestors` 'none' - Prevents your site from being embedded in iframes
  - `object-src` 'none' - Blocks plugins like Flash
  - `form-action` **'self'** - Forms can only be submitted to the same source
- XSRF configuration enabled in `front/task-manager/src/app/app.config.ts`.
- Supabase auth storage switched to `sessionStorage` to balance UX and security.
- XSS and CSRF tests added under `front/task-manager/src/app/core/security`.

## Findings

- No direct usage of `localStorage` in app source.
- Angular template interpolation is used without `innerHTML` bindings.
- Auth tokens are stored in `sessionStorage` (per-tab persistence).

## Residual Risks / Follow-ups

- Production hosting must set the same (or stricter) HTTP security headers server-side.
- If cookie-based auth is introduced, ensure backend sets `SameSite` and `Secure` on auth cookies.
- Consider adding CSP `report-uri` or `report-to` for monitoring in production.
