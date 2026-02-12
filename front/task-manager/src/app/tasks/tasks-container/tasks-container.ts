import { TaskService } from './../service/task-service';
import { Component, computed, inject, signal } from '@angular/core';
import { Sidebar } from '../../UI/sidebar/sidebar';
import { TaskCard } from '../task-card/task-card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { TaskSortBy, TaskSortOrder } from '../service/task-service';

@Component({
  selector: 'app-tasks-container',
  standalone: true,
  imports: [Sidebar, TaskCard, ReactiveFormsModule],
  templateUrl: './tasks-container.html',
  styleUrl: './tasks-container.css',
})
export class TasksContainer {
  taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  tasks = this.taskService.tasks;
  loading = this.taskService.loading;
  pagination = this.taskService.pagination;
  filterStatus = signal<'all' | 'pending' | 'completed'>('all');
  sortOption = signal<'created_desc' | 'created_asc' | 'updated_desc' | 'title_asc' | 'title_desc'>(
    'created_desc',
  );

  filteredTasks = computed(() => {
    const tasks = this.tasks();
    switch (this.filterStatus()) {
      case 'completed':
        return tasks.filter((task) => task.completed);
      case 'pending':
        return tasks.filter((task) => !task.completed);
      default:
        return tasks;
    }
  });

  skeletonItems = Array.from({ length: 6 });

  showCreateForm = signal<boolean>(false);

  createForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    completed: [false],
  });

  toggleCreateForm() {
    this.showCreateForm.update((value) => !value);
    if (!this.showCreateForm()) {
      this.resetCreateForm();
    }
  }

  createTask() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.value;
    const payload = {
      title: (formValue.title ?? '').toString().trim(),
      description: (formValue.description ?? '').toString().trim(),
      completed: Boolean(formValue.completed),
    };

    this.taskService.addTask(payload).subscribe(() => {
      this.resetCreateForm();
      this.showCreateForm.set(false);
      this.taskService.refreshTasks(true);
    });
  }

  setFilter(status: 'all' | 'pending' | 'completed') {
    this.filterStatus.set(status);
  }

  setSort(option: 'created_desc' | 'created_asc' | 'updated_desc' | 'title_asc' | 'title_desc') {
    this.sortOption.set(option);

    const map: Record<
      typeof option,
      {
        sortBy: TaskSortBy;
        sortOrder: TaskSortOrder;
      }
    > = {
      created_desc: { sortBy: 'createdAt', sortOrder: 'desc' },
      created_asc: { sortBy: 'createdAt', sortOrder: 'asc' },
      updated_desc: { sortBy: 'updatedAt', sortOrder: 'desc' },
      title_asc: { sortBy: 'title', sortOrder: 'asc' },
      title_desc: { sortBy: 'title', sortOrder: 'desc' },
    };

    const target = map[option];
    this.taskService.setSort(target.sortBy, target.sortOrder);
  }

  nextPage() {
    const { page, totalPages } = this.pagination();
    if (page >= totalPages) {
      return;
    }
    this.taskService.setPage(page + 1);
  }

  previousPage() {
    const { page } = this.pagination();
    if (page <= 1) {
      return;
    }
    this.taskService.setPage(page - 1);
  }

  goToPage(page: number) {
    this.taskService.setPage(page);
  }

  deletingTask(id: number) {
    const previousTasks = this.taskService.getTasksSnapshot();
    this.taskService.removeTaskFromStore(id);

    this.taskService.deleteTask(id).subscribe({
      error: (error) => {
        console.error('Error deleting task:', error);
        this.taskService.restoreTasks(previousTasks);
      },
    });
  }

  private resetCreateForm() {
    this.createForm.reset({
      title: '',
      description: '',
      completed: false,
    });
  }
}
