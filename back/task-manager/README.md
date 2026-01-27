# Mini Project - Task API (In-Memory)

**Overview:**

Small Node + TypeScript Express API to manage tasks in memory (no database).

## Endpoints

- GET /api/tasks - list tasks (supports `page` and `limit` query params)
- GET /api/tasks/:id - get task by id
- POST /api/tasks - create task (body: `{ title, description? }`)
- PUT /api/tasks/:id - update task
- PATCH /api/tasks/:id - partial update
- DELETE /api/tasks/:id - delete task

## Install

Run from the project folder:

```bash
npm install
```

## Scripts

- `npm run build` - compile TypeScript to `./dist`
- `npm run start` - run compiled `./dist/index.js`
- `npm run dev` - run in development using `ts-node-dev` (hot reload)

## Notes

- The repository uses an in-memory array for tasks located in `src/data/tasks.ts`.
- If you do not have `ts-node-dev` installed globally, `npm run dev` will work after `npm install` since `ts-node-dev` is listed as a devDependency.
- The project includes a centralized error handler (`src/error/errorHandler.ts`) and a custom `ApiError` class.

## Example

Start dev server:

```bash
npm install
npm run dev
```

Build and run:

```bash
npm run build
npm run start
```
