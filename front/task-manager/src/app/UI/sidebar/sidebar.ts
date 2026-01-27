import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../tasks/service/task-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isOpen = signal(false);
  taskService = inject(TaskService);
  tasks = this.taskService.tasks();
  mode = input.required<string>();

  filterByStatus(status: string) {
    switch (status) {
      case 'all':
        return this.tasks;
      case 'completed':
        return this.tasks.filter((task) => task.completed);
      case 'pending':
        return this.tasks.filter((task) => !task.completed);
      default:
        return this.tasks;
    }
  }
  toggleSidebar() {
    this.isOpen.update((value) => !value);
  }

  closeSidebar() {
    this.isOpen.set(false);
  }
  navigateToTask(id: number) {
    window.location.href = '/tasks/details/' + id;
  }
}
