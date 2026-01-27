import { DecimalPipe } from '@angular/common';
import { TaskService } from './../tasks/service/task-service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  taskService = inject(TaskService);

  completedCount(): number {
    return this.taskService.tasks().filter((task) => task.completed).length;
  }
  inProgressCount(): number {
    return this.taskService.tasks().filter((task) => !task.completed).length;
  }
  totalCount(): number {
    return this.taskService.tasks().length;
  }
  getProgressPercentage(): number {
    const total = this.totalCount();
    const completed = this.completedCount();
    if (total === 0) {
      return 0;
    }
    return (completed / total) * 100;
  }

  navigateToTasks() {
    window.location.href = '/tasks';
  }
}
