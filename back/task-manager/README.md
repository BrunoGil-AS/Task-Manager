# Task Manager Backend

A robust and scalable RESTful API backend for a Task Manager application, built with Express.js, TypeScript, and Supabase.

## 📋 Project Overview

This backend service provides a comprehensive API for managing tasks with features including:

- **Task Management**: Create, read, update, and delete tasks
- **Task Toggling**: Toggle task completion status
- **Database Integration**: Persistent storage using Supabase PostgreSQL
- **Security**: Helmet for HTTP security headers, CORS support, and input validation
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Request logging middleware for debugging and monitoring
- **Authentication Ready**: JWT token support via Jose library

## 🗂️ Project Structure

```plain
src/
├── app.ts                 # Express application setup and middleware configuration
├── index.ts              # Server entry point
├── config/
│   └── supabaseClient.ts # Supabase client initialization
├── error/
│   ├── ApiError.ts       # Custom API error class
│   └── errorHandler.ts   # Centralized error handling middleware
├── middleware/
│   ├── auth.ts           # Authentication middleware
│   └── loggingMiddleware.ts # Request logging middleware
├── tasks/
│   ├── controllers/
│   │   └── TaskController.ts # Business logic for task operations
│   ├── data/
│   │   └── tasks.ts      # Database query functions
│   ├── middleware/
│   │   └── validateBody.ts # Request validation middleware
│   ├── models/
│   │   └── Task.ts       # TypeScript Task model
│   ├── routes/
│   │   └── router.ts     # Task API routes
│   ├── schemas/
│   │   └── TaskSchema.ts # Zod validation schemas
│   └── services/
│       └── taskService.ts # Business logic layer
├── types/
│   ├── database.types.ts # Database type definitions
│   └── supabase.ts       # Supabase type definitions
└── users/
    ├── data/
    │   └── users.ts      # User database functions
    ├── model/
    │   └── User.ts       # TypeScript User model
    └── schemas/
        └── UserSchema.ts # User validation schemas
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project setup

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd back/task-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `config/` directory:

   ```env
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Start the server**

   ```bash
   npm run dev
   ```

## 📦 Available Scripts

| Script          | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run build` | Compile TypeScript to JavaScript                 |
| `npm run watch` | Watch for TypeScript changes and recompile       |
| `npm run exec`  | Execute the compiled JavaScript                  |
| `npm run fast`  | Build and run in one command                     |
| `npm run dev`   | Run development server with hot reload (nodemon) |

## 🔌 API Endpoints

All task endpoints are prefixed with `/api/tasks`

### Tasks

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| GET    | `/api/tasks`            | Get all tasks                 |
| GET    | `/api/tasks/:id`        | Get task by ID                |
| POST   | `/api/tasks`            | Create a new task             |
| PUT    | `/api/tasks/:id`        | Update a task                 |
| PATCH  | `/api/tasks/:id/toggle` | Toggle task completion status |
| DELETE | `/api/tasks/:id`        | Delete a task                 |

### Health Check

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

## 🛡️ Security Features

- **Helmet**: Protects against common web vulnerabilities
- **CORS**: Cross-Origin Resource Sharing enabled for frontend integration
- **Validation**: Request body validation using Zod schemas
- **Error Handling**: Centralized error handling prevents information leakage
- **JWT Support**: Ready for token-based authentication

## 📚 Key Dependencies

| Package               | Version | Purpose               |
| --------------------- | ------- | --------------------- |
| express               | ^5.2.1  | Web framework         |
| @supabase/supabase-js | ^2.93.2 | Database client       |
| typescript            | ^5.9.3  | Type safety           |
| zod                   | ^4.3.6  | Schema validation     |
| helmet                | ^8.1.0  | Security headers      |
| cors                  | ^2.8.6  | CORS support          |
| jose                  | ^6.1.3  | JWT handling          |
| express-validator     | ^7.3.1  | Additional validation |
| dotenv                | ^17.2.3 | Environment variables |

## 🔧 Development Tools

| Package        | Version | Purpose                        |
| -------------- | ------- | ------------------------------ |
| typescript     | ^5.9.3  | Type checking                  |
| @types/node    | ^25.1.0 | Node.js type definitions       |
| @types/express | ^5.0.6  | Express type definitions       |
| @types/cors    | ^2.8.19 | CORS type definitions          |
| nodemon        | ^3.1.11 | Auto-reload during development |
| ts-node        | ^10.9.2 | Run TypeScript directly        |

## 🏗️ Architecture Overview

### Layered Architecture

The backend follows a clean layered architecture:

- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and validation
- **Data Access**: Database queries and operations
- **Models**: TypeScript type definitions
- **Middleware**: Cross-cutting concerns (auth, logging, validation)

### Error Handling

Custom `ApiError` class for consistent error responses:

```typescript
new ApiError(statusCode, message, errors?: Record<string, string>)
```

## 🔄 Request Flow

1. Request arrives at Express server
2. Logging middleware records the request
3. Helmet applies security headers
4. CORS middleware processes the request
5. Route matches endpoint
6. Validation middleware validates request body
7. Controller processes the request
8. Service executes business logic
9. Data access layer queries the database
10. Response is returned through error handler (if error) or directly

## 📝 Environment Configuration

The project uses `dotenv` for environment variable management. Create a `.env` file:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
```

## 🚀 Deployment

The backend can be deployed to various platforms:

- **Vercel**: Supports Node.js
- **Heroku**: Full support with buildpack
- **Railway**: Container-based deployment
- **Supabase Edge Functions**: Serverless alternative
- **Docker**: Container deployment

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev/)

## 👤 Author

Bruno Gil R.

## 📄 License

ISC
