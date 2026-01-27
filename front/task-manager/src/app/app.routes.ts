import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TaskDetails } from './tasks/task-details/task-details';
import { TasksContainer } from './tasks/tasks-container/tasks-container';

export const routes: Routes = [
  // home to show number of tasks on progress and completed
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  // route to show all the task list showing each task card
  { path: 'tasks', component: TasksContainer },
  // Route details rendering dynamically based on task id as parameter: tasks/details/:id
  { path: 'tasks/details/:id', component: TaskDetails },
];
