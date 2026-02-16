import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../tasks/service/task-service';
import { Router } from '@angular/router';

/**
 * Sidebar component with status filters, counters, and quick task navigation.
 */
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
  tasks = this.taskService.tasks;
  mode = input.required<string>();
  statusChange = output<'all' | 'pending' | 'completed'>();
  selectedStatus = signal<'all' | 'pending' | 'completed'>('all');
  private router = inject(Router);

  totalCount = computed(() => this.tasks().length);
  pendingCount = computed(() => this.tasks().filter((task) => !task.completed).length);
  completedCount = computed(() => this.tasks().filter((task) => task.completed).length);

  /**
   * Emits selected task status filter.
   */
  filterByStatus(status: 'all' | 'pending' | 'completed') {
    this.selectedStatus.set(status);
    this.statusChange.emit(status);
  }
  /**
   * Toggles mobile sidebar visibility.
   */
  toggleSidebar() {
    this.isOpen.update((value) => !value);
  }

  /**
   * Closes mobile sidebar visibility.
   */
  closeSidebar() {
    this.isOpen.set(false);
  }
  /**
   * Navigates to details page for a selected task.
   */
  navigateToTask(id: number) {
    this.router.navigate(['/tasks/details', id]);
  }
}
