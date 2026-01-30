import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TaskDetails } from './tasks/task-details/task-details';
import { TasksContainer } from './tasks/tasks-container/tasks-container';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard], // Solo accesible si NO está autenticado
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard], // Solo accesible si está autenticado
  },
  {
    path: 'tasks',
    canActivate: [authGuard], // Solo accesible si está autenticado
    children: [
      { path: '', component: TasksContainer },
      { path: 'details/:id', component: TaskDetails },
    ],
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
