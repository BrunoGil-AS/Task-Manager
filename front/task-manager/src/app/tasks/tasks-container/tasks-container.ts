import { TaskService } from './../service/task-service';
import { Component, inject } from '@angular/core';
import { Sidebar } from '../../UI/sidebar/sidebar';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-tasks-container',
  imports: [Sidebar, TaskCard],
  templateUrl: './tasks-container.html',
  styleUrl: './tasks-container.css',
})
export class TasksContainer {
  taskService = inject(TaskService);

  tasks = this.taskService.tasks;
}
