# Testing Guide

This document summarizes the automated tests implemented for the Task Manager project, explains how they work, and highlights what is still missing. It is intended to be illustrative and easy to follow for anyone new to the codebase.

---

## Overview

The project currently has automated tests for both the backend (Node/Express) and the frontend (Angular). The tests focus on **unit-level behavior** with **mocks**, ensuring predictable results without depending on real infrastructure (Supabase, HTTP APIs, etc.).

---

## Backend Tests

### Tech Stack

- **Jest**: Test runner and assertion library.
- **ts-jest**: TypeScript preset for Jest (ESM compatible).
- **Node ESM**: The backend uses `type: "module"` with `NodeNext` modules.

### Configuration Files

- `back/task-manager/jest.config.cjs`
  - ESM-compatible Jest preset (`ts-jest/presets/default-esm`).
  - Resolves `.js` import specifiers to `.ts` for TypeScript source tests.
- `back/task-manager/tsconfig.test.json`
  - Adds Jest + Node types for tests.
  - Disables emit (`noEmit: true`).

### What Is Covered

**Services (unit tests with mocks):**

- `TaskService`
  - Fetch tasks by user.
  - Get by id (including “not found”).
  - Create/update/delete tasks.
  - Toggle completion (using internal flow).

- `UserService`
  - Get user profile.
  - Create user.
  - Update user.
  - Disable/delete user.

**Controllers (unit tests with mocks):**

- `TaskController`
  - Authorization checks.
  - Input validation.
  - Success responses.
  - Error responses (404/400/500).

- `UserController`
  - Authorization checks.
  - Validation (name required).
  - Success responses.
  - Error responses.

### How Mocks Work

- Supabase client and logger are mocked to isolate logic.
- Services are mocked in controller tests.
- This keeps tests deterministic and fast.

### Run Backend Tests

```bash
cd back/task-manager
npm test
```

---

## Frontend Tests

### Frontend: Tech Stack

- **Angular TestBed** for component/service testing.
- **Vitest** globals (Angular test runner integrates these in this setup).
- **HttpClientTestingModule** for HTTP mocking in service tests.
- **RouterTestingModule** for components using router links.

### Frontend: What Is Covered

**Auth:**

- `AuthService`
  - Session initialization.
  - Sign up / sign in / sign out flows.
  - Password reset & update.

- `LoginComponent`
  - Form validation.
  - Successful login navigation.
  - Error message display.

- `RegisterComponent`
  - Form validation.
  - Password match validation.
  - Successful sign-up flow + navigation.
  - Error message display.

**Tasks:**

- `TaskService`
  - Initial load behavior.
  - CRUD HTTP calls (GET/POST/PUT/DELETE).
  - Cache-based read flow.

- `TaskCard`
  - Data rendering helpers.
  - Delete event emission.

- `TaskDetails`
  - Route param load.
  - Update + delete handlers.
  - Navigation back.

- `TaskForm`
  - Valid/invalid form behavior.
  - Emits updated task payload.

- `TasksContainer`
  - Filtering logic.
  - Create task flow.
  - Optimistic delete + rollback.

**UI:**

- `Sidebar`, `Navbar`, `Footer`, `Home`, `App` basic coverage.

### Run Frontend Tests

```bash
cd front/task-manager
npm test
```

---

## Known Gaps / Missing Tests

### Backend

- **Integration tests** for real HTTP routes (supertest).
- **Authentication middleware** tests against signed/invalid JWTs.
- **Supabase integration** tests (currently mocked only).
- **Error handling paths** for database connection failures.

### Frontend

- **Guards** (`authGuard`, `guestGuard`) behavior in routing.
- **User profile components** behavior (not just creation).
- **Global error UI** rendering and dismissal behavior.
- **Sidebar/task counts** behavior under empty + filtered states.
- **Auth token interceptor** (if present in app shell) behavior for 401/403.

### End-to-End (E2E)

- No E2E tests yet (Playwright/Cypress recommended).
- Missing user flows:
  - Login / sign-up
  - Create task
  - Edit task
  - Delete task
  - Profile update

---

## Recommendations

- Add **API integration tests** using `supertest` for backend routes.
- Add **guard tests** for auth/guest routing in Angular.
- Add **E2E tests** for the full user journey.
- Use CI to run both backend and frontend tests on every push.

---

## Notes

The frontend tests currently run under Angular’s test runner, but still use Vitest globals. This matches the existing project setup. If you choose to migrate to pure Jasmine/Karma or pure Vitest later, update the specs and test config accordingly.
