# Task Manager Frontend

A modern and responsive Angular 21 frontend application for managing tasks efficiently. Built with TypeScript, standalone components, and signal-based reactivity.

## 📋 Project Overview

This frontend application provides a comprehensive user interface for task management with features including:

- **Dashboard**: Home page with task statistics and progress overview
- **Task Management**: Create, view, edit, and delete tasks
- **Task Details**: Detailed view and editing of individual tasks
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Modern UI**: Clean and intuitive user interface with consistent styling
- **Component-Based Architecture**: Modular, reusable components
- **Signal-Based Reactivity**: Angular 21 signals for state management
- **API Integration**: Seamless communication with the backend API

## 🗂️ Project Structure

```plain
src/
├── main.ts                 # Application bootstrap
├── index.html             # Root HTML template
├── styles.css             # Global styles
├── app/
│   ├── app.ts             # Root component
│   ├── app.html           # Root template
│   ├── app.css            # Root styles
│   ├── app.config.ts      # Angular configuration and providers
│   ├── app.routes.ts      # Application routing configuration
│   ├── core/
│   │   └── api-routes.ts  # API endpoint constants
│   ├── home/
│   │   ├── home.ts        # Home component logic
│   │   ├── home.html      # Home template
│   │   ├── home.css       # Home styles
│   │   └── home.spec.ts   # Home component tests
│   ├── tasks/
│   │   ├── models/
│   │   │   └── task.model.ts # TypeScript Task interface
│   │   ├── service/
│   │   │   ├── task-service.ts # Task service for API calls
│   │   │   ├── task-service.spec.ts # Service tests
│   │   │   └── model/
│   │   │       └── api-response.ts # API response types
│   │   ├── task-card/
│   │   │   ├── task-card.ts # Task card component
│   │   │   ├── task-card.html # Task card template
│   │   │   ├── task-card.css # Task card styles
│   │   │   └── task-card.spec.ts # Component tests
│   │   ├── task-details/
│   │   │   ├── task-details.ts # Task details component
│   │   │   ├── task-details.html # Task details template
│   │   │   ├── task-details.css # Task details styles
│   │   │   └── task-details.spec.ts # Component tests
│   │   ├── task-form/
│   │   │   ├── task-form.ts # Task form component
│   │   │   ├── task-form.html # Task form template
│   │   │   ├── task-form.css # Task form styles
│   │   │   └── task-form.spec.ts # Component tests
│   │   └── tasks-container/
│   │       ├── tasks-container.ts # Tasks list container
│   │       ├── tasks-container.html # Container template
│   │       ├── tasks-container.css # Container styles
│   │       └── tasks-container.spec.ts # Component tests
│   └── UI/
│       ├── footer/
│       │   ├── footer.ts # Footer component
│       │   ├── footer.html # Footer template
│       │   ├── footer.css # Footer styles
│       │   └── footer.spec.ts # Footer tests
│       ├── navbar/
│       │   ├── navbar.ts # Navigation bar component
│       │   ├── navbar.html # Navbar template
│       │   ├── navbar.css # Navbar styles
│       │   └── navbar.spec.ts # Navbar tests
│       └── sidebar/
│           ├── sidebar.ts # Sidebar component
│           ├── sidebar.html # Sidebar template
│           ├── sidebar.css # Sidebar styles
│           └── sidebar.spec.ts # Sidebar tests
└── public/
    └── [Static assets]
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (v21.0 or higher)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd front/task-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API routes**

   Edit `src/app/core/api-routes.ts` to match your backend URL:

   ```typescript
   export const API_BASE_URL = 'http://localhost:3000/api';
   export const TASKS_ENDPOINT = `${API_BASE_URL}/tasks`;
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Open in browser**

   ```plain
   http://localhost:4200
   ```

## 📦 Available Scripts

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `npm start`     | Start the development server (ng serve) |
| `npm run build` | Build the project for production        |
| `npm run watch` | Watch for file changes and rebuild      |
| `npm test`      | Run unit tests with Vitest              |
| `ng`            | Angular CLI commands                    |

## 🧭 Application Routes

| Route                | Component      | Description                      |
| -------------------- | -------------- | -------------------------------- |
| `/`                  | Home           | Redirects to `/home`             |
| `/home`              | Home           | Dashboard with task statistics   |
| `/tasks`             | TasksContainer | List of all tasks                |
| `/tasks/details/:id` | TaskDetails    | Detailed view of a specific task |

## 🧩 Components Overview

### Root Component (App)

The main application container that includes:

- Router outlet for route rendering
- Navigation bar
- Footer
- Global layout structure

### UI Components

#### Navbar

- Navigation menu
- Logo and branding
- Links to main sections
- Responsive mobile menu

#### Sidebar

- Secondary navigation
- Quick access links
- Application information

#### Footer

- Company/project information
- Links and resources
- Copyright information

### Feature Components

#### Home

Dashboard component showing:

- Task statistics (completed, in progress, total)
- Visual progress indicators
- Quick access to tasks section
- Summary metrics

#### TasksContainer

Main tasks management component:

- Display all tasks in a list
- Task filtering and sorting
- Create new task button
- Integrate with task cards

#### TaskCard

Individual task display component:

- Task title and description
- Completion status
- Actions (view details, edit, delete)
- Visual indicators
- Toggle completion on click

#### TaskDetails

Detailed view component:

- Full task information
- Edit task functionality
- Delete option
- Task completion toggle
- Dynamic routing with task ID parameter

#### TaskForm

Form component for task creation/editing:

- Input fields (title, description, etc.)
- Form validation
- Submit and cancel buttons
- Reactive forms implementation

## 🔗 API Integration

The application communicates with the backend API through:

- **Service**: `TaskService` in `src/app/tasks/service/task-service.ts`
- **Base URL**: Configured in `src/app/core/api-routes.ts`
- **HTTP Client**: Angular's built-in HttpClientModule

### Available API Methods

```typescript
// Get all tasks
getAllTasks(): Observable<ApiResponse<Task[]>>

// Get task by ID
getTaskById(id: string): Observable<ApiResponse<Task>>

// Create new task
createTask(task: Task): Observable<ApiResponse<Task>>

// Update task
updateTask(id: string, task: Task): Observable<ApiResponse<Task>>

// Toggle task completion
toggleTask(id: string): Observable<ApiResponse<Task>>

// Delete task
deleteTask(id: string): Observable<ApiResponse<void>>
```

## 📦 Dependencies

| Package                   | Version | Purpose                      |
| ------------------------- | ------- | ---------------------------- |
| @angular/core             | ^21.0.0 | Angular core framework       |
| @angular/common           | ^21.0.0 | Common Angular utilities     |
| @angular/forms            | ^21.0.0 | Reactive and template forms  |
| @angular/router           | ^21.0.0 | Application routing          |
| @angular/platform-browser | ^21.0.0 | Browser platform             |
| rxjs                      | ~7.8.0  | Reactive programming library |
| tslib                     | ^2.3.0  | TypeScript helper library    |

## 🛠️ Development Tools

| Package               | Version | Purpose                 |
| --------------------- | ------- | ----------------------- |
| @angular/cli          | ^21.0.4 | Angular development CLI |
| @angular/build        | ^21.1.0 | Build system            |
| @angular/compiler-cli | ^21.0.0 | Template compiler       |
| typescript            | ~5.9.2  | TypeScript compiler     |
| vitest                | ^4.0.8  | Unit testing framework  |
| jsdom                 | ^27.1.0 | DOM testing environment |

## ⚙️ Configuration Files

- **angular.json**: Angular CLI configuration
- **tsconfig.json**: TypeScript compiler options
- **tsconfig.app.json**: App-specific TypeScript config
- **tsconfig.spec.json**: Test-specific TypeScript config
- **.editorconfig**: Editor formatting rules

## 🎨 Styling

The project uses:

- **CSS**: Custom stylesheets for each component
- **Global Styles**: `src/styles.css` for application-wide styles
- **Component Styles**: Scoped CSS per component
- **Responsive Design**: Mobile-first approach using media queries

## 🧪 Testing

Testing is configured with:

- **Framework**: Vitest
- **Test Files**: `*.spec.ts` files
- **Run Tests**: `npm test`

Each component includes a `.spec.ts` file for unit tests.

## 🔄 Signal-Based Reactivity

This Angular 21 application uses signals for reactive state management:

```typescript
import { signal } from '@angular/core';

// Create a signal
protected readonly title = signal('task-manager');

// Access signal value
this.title() // returns current value

// Update signal
this.title.set('new value');
```

## 🏗️ Architecture

### Component Hierarchy

```plain
App (Root)
├── Navbar
├── Sidebar
├── RouterOutlet
│   ├── Home
│   ├── TasksContainer
│   │   └── TaskCard (multiple)
│   └── TaskDetails
├── TaskForm (modal/inline)
└── Footer
```

### Data Flow

1. Component initialization
2. Signal creation with initial state
3. User interaction triggers action
4. Service calls backend API
5. Response updates signals
6. Template re-renders with new data

## 🌐 Environment Setup

### Development

```bash
npm start
```

- Runs on `http://localhost:4200`
- Hot module reloading enabled
- Source maps available

### Production Build

```bash
npm run build
```

- Output in `dist/task-manager`
- Optimized and minified
- Ready for deployment

## 🚀 Deployment

The frontend can be deployed to:

- **Vercel**: Zero-config deployment
- **Netlify**: Drag and drop or Git integration
- **Firebase Hosting**: Google's hosting platform
- **GitHub Pages**: Static site hosting
- **AWS S3 + CloudFront**: CDN distribution
- **Docker**: Containerized deployment
- **Traditional Web Servers**: Nginx, Apache, etc.

### Build for Production

```bash
npm run build
# Output files in dist/task-manager
```

## 📖 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular 21 Release Notes](https://angular.io/guide/releases)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

## 🔗 Related Projects

- **Backend**: See [back/task-manager/README.md](../../back/task-manager/README.md)
- **Component Documentation**: See [COMPONENTES.md](./COMPONENTES.md)

## 👤 Author

Bruno Gil R.

## 📄 License

ISC
