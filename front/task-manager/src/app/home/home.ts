import { DecimalPipe } from '@angular/common';
import { TaskService } from './../tasks/service/task-service';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Dashboard component with task summary counters and quick navigation.
 */
@Component({
  selector: 'app-home',
  imports: [DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  taskService = inject(TaskService);
  private router = inject(Router);

  /**
   * Returns the number of completed tasks in the current in-memory list.
   */
  completedCount(): number {
    return this.taskService.tasks().filter((task) => task.completed).length;
  }
  /**
   * Returns the number of non-completed tasks in the current in-memory list.
   */
  inProgressCount(): number {
    return this.taskService.tasks().filter((task) => !task.completed).length;
  }
  /**
   * Returns the total number of tasks.
   */
  totalCount(): number {
    return this.taskService.tasks().length;
  }
  /**
   * Computes completed percentage for the dashboard progress bar.
   */
  getProgressPercentage(): number {
    const total = this.totalCount();
    const completed = this.completedCount();
    if (total === 0) {
      return 0;
    }
    return (completed / total) * 100;
  }

  /**
   * Navigates to the tasks view.
   */
  navigateToTasks() {
    this.router.navigate(['/tasks']);
  }
}
