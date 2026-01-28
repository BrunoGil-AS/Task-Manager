# Task Manager

A full-stack task management application with a modern Angular frontend and a robust Express.js backend. This project demonstrates a complete web application architecture using TypeScript, Angular 21, and Supabase.

## 📋 Project Overview

Task Manager is a comprehensive web application designed to help users efficiently manage their daily tasks. The application features a responsive user interface for desktop and mobile devices, a powerful backend API, and persistent data storage using Supabase PostgreSQL.

### Key Features

- ✅ **Complete Task Management**: Create, read, update, and delete tasks
- 🎯 **Task Details**: View comprehensive task information with dynamic routing
- 📊 **Dashboard**: Overview of task statistics and progress metrics
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **Secure API**: Helmet security headers, input validation, and error handling
- 🗄️ **Database Integration**: Persistent storage with Supabase PostgreSQL
- 🚀 **Modern Tech Stack**: Angular 21, Express.js, TypeScript, and RxJS
- 📦 **Component Architecture**: Modular, reusable components following best practices

## 🏗️ Project Architecture

```
Task-Manager/
├── back/                    # Backend application (Express.js + Node.js)
│   └── task-manager/
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md        # Backend documentation
│       └── supabase/        # Supabase configuration
│
├── front/                   # Frontend application (Angular 21)
│   └── task-manager/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── angular.json
│       ├── README.md        # Frontend documentation
│       └── COMPONENTES.md   # Component documentation
│
└── docs/                    # Project documentation
    ├── support_auth.md
    └── support_material.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- Git

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd back/task-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `src/config/.env`:

   ```env
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```

4. **Start the backend server**

   ```bash
   npm run dev
   ```

   Backend runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)

   ```bash
   cd front/task-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API routes** (optional)

   Update `src/app/core/api-routes.ts` if backend URL is different:

   ```typescript
   export const API_BASE_URL = "http://localhost:3000/api";
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

   Frontend runs on `http://localhost:4200`

5. **Open application in browser**
   ```
   http://localhost:4200
   ```

## 📚 Project Structure Details

### Backend (`back/task-manager/`)

The backend is built with Express.js and provides a RESTful API for task management.

**Key Technologies:**

- Express.js v5.2 - Web framework
- TypeScript v5.9 - Type safety
- Supabase - Database and authentication
- Zod - Schema validation
- Helmet - Security headers
- CORS - Cross-origin support

**Main Features:**

- RESTful API endpoints
- Task CRUD operations
- Input validation with Zod schemas
- Centralized error handling
- Logging middleware
- Authentication ready (JWT support)

**For detailed information:** See [back/task-manager/README.md](back/task-manager/README.md)

### Frontend (`front/task-manager/`)

The frontend is built with Angular 21 and provides a modern, responsive user interface.

**Key Technologies:**

- Angular v21 - Frontend framework
- TypeScript v5.9 - Type safety
- RxJS v7.8 - Reactive programming
- Standalone Components - Modern Angular approach
- Signals - State management

**Main Features:**

- Responsive design for all devices
- Component-based architecture
- Service-based API integration
- Standalone components
- Signal-based reactivity
- Comprehensive routing
- Unit testing with Vitest

**For detailed information:** See [front/task-manager/README.md](front/task-manager/README.md)

## 🔄 Application Flow

```
┌─────────────────────────────────────────────────────┐
│                  User Browser                        │
│              (Angular Frontend on 4200)              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST API
                       ↓
┌──────────────────────────────────────────────────────┐
│              Express.js Backend (3000)               │
│  ┌────────────────────────────────────────────────┐ │
│  │         API Routes & Controllers               │ │
│  │  - Task CRUD Operations                        │ │
│  │  - Input Validation                            │ │
│  │  - Error Handling                              │ │
│  └────────────────────┬──────────────────────────┘ │
│                       │                             │
│  ┌────────────────────↓──────────────────────────┐ │
│  │      Supabase PostgreSQL Database             │ │
│  │  - Task records                                │ │
│  │  - User information                            │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api`

### Tasks Management

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | `/api/tasks`            | Get all tasks          |
| GET    | `/api/tasks/:id`        | Get task by ID         |
| POST   | `/api/tasks`            | Create new task        |
| PUT    | `/api/tasks/:id`        | Update task            |
| PATCH  | `/api/tasks/:id/toggle` | Toggle task completion |
| DELETE | `/api/tasks/:id`        | Delete task            |

### Health Check

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| GET    | `/health` | Server health status |

## 🧭 Frontend Routes

| Route                | Component       | Description               |
| -------------------- | --------------- | ------------------------- |
| `/`                  | Home (redirect) | Redirects to `/home`      |
| `/home`              | Home            | Dashboard with statistics |
| `/tasks`             | TasksContainer  | List of all tasks         |
| `/tasks/details/:id` | TaskDetails     | Task detail view          |

## 💾 Database Schema

The application uses Supabase PostgreSQL. Main tables:

### Tasks Table

```
- id (UUID, Primary Key)
- title (String)
- description (Text)
- completed (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
- user_id (UUID, Foreign Key)
```

### Users Table

```
- id (UUID, Primary Key)
- email (String)
- name (String)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## 🛠️ Development Commands

### Backend

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run build` | Compile TypeScript       |
| `npm run dev`   | Start development server |
| `npm run watch` | Watch for changes        |
| `npm run exec`  | Run compiled JavaScript  |

### Frontend

| Command         | Description             |
| --------------- | ----------------------- |
| `npm start`     | Start dev server (4200) |
| `npm run build` | Build for production    |
| `npm run watch` | Watch and rebuild       |
| `npm test`      | Run unit tests          |

## 🧪 Testing

### Backend Testing

```bash
cd back/task-manager
# Tests can be added using Jest or Mocha
```

### Frontend Testing

```bash
cd front/task-manager
npm test
```

The frontend uses Vitest with jsdom for unit testing. Each component includes `.spec.ts` files.

## 🔒 Security Features

### Backend

- Helmet middleware for HTTP security headers
- Input validation with Zod schemas
- CORS protection
- Environment variable protection
- Centralized error handling

### Frontend

- XSS protection through Angular sanitization
- CSRF tokens (built into Angular)
- Secure API communication
- Input validation before sending to backend

## 📦 Dependencies Overview

### Backend Key Dependencies

- express - Web framework
- @supabase/supabase-js - Database client
- zod - Schema validation
- helmet - Security headers
- cors - CORS middleware
- jose - JWT handling

### Frontend Key Dependencies

- @angular/core - Angular framework
- @angular/forms - Form handling
- @angular/router - Routing
- rxjs - Reactive programming
- typescript - Type safety

See individual READMEs for complete dependency lists.

## 🚀 Deployment

### Backend Deployment Options

- Vercel Functions
- Heroku
- Railway
- Supabase Edge Functions
- AWS Lambda
- Google Cloud Run
- Docker containers

### Frontend Deployment Options

- Vercel
- Netlify
- Firebase Hosting
- GitHub Pages
- AWS S3 + CloudFront
- Docker containers
- Traditional web servers (Nginx, Apache)

## 📖 Documentation

- [Backend README](back/task-manager/README.md) - Detailed backend documentation
- [Frontend README](front/task-manager/README.md) - Detailed frontend documentation
- [Component Documentation](front/task-manager/COMPONENTES.md) - Angular component details
- [Support Materials](docs/support_material.md) - Additional resources
- [Authentication Support](docs/support_auth.md) - Auth implementation guide

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

#### Frontend (api-routes.ts)

```typescript
export const API_BASE_URL = "http://localhost:3000/api";
```

## 📝 File Organization Best Practices

### Backend

- Routes in `tasks/routes/`
- Controllers in `tasks/controllers/`
- Services in `tasks/services/`
- Data access in `tasks/data/`
- Models in `tasks/models/`
- Schemas in `tasks/schemas/`
- Middleware in `tasks/middleware/`

### Frontend

- Components by feature folder
- Services in feature `service/` directory
- Models in feature `models/` directory
- Shared UI components in `app/UI/`
- Styles co-located with components

## 🤝 Contributing

1. Create a new branch for your feature

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the project structure

3. Test your changes

   ```bash
   # Backend
   cd back/task-manager && npm test

   # Frontend
   cd front/task-manager && npm test
   ```

4. Commit your changes

   ```bash
   git commit -m "Add your feature description"
   ```

5. Push to the repository
   ```bash
   git push origin feature/your-feature-name
   ```

## 🐛 Troubleshooting

### Backend won't start

- Check if port 3000 is available
- Verify Supabase credentials in `.env`
- Ensure database connection is working

### Frontend won't connect to backend

- Check if backend is running on port 3000
- Verify API_BASE_URL in `api-routes.ts`
- Check browser console for CORS errors

### Database connection issues

- Verify Supabase URL and keys
- Check database tables exist
- Ensure network connectivity

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [RxJS Documentation](https://rxjs.dev/)

## 👤 Author

Bruno Gil R.

## 📄 License

ISC

---

## 🎯 Next Steps

1. **Setup**: Follow the Quick Start section above
2. **Explore**: Review individual READMEs for frontend and backend
3. **Develop**: Make changes following the project structure
4. **Test**: Run tests before committing
5. **Deploy**: Use your preferred hosting platform

## 📞 Support

For issues or questions:

1. Check the project documentation
2. Review support materials in `docs/` folder
3. Check browser console for frontend errors
4. Check server logs for backend errors

---

**Last Updated**: January 28, 2026  
**Version**: 1.0.0
