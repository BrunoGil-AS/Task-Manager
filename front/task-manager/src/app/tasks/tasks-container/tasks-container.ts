import { TaskService } from './../service/task-service';
import { Component, computed, inject, signal } from '@angular/core';
import { Sidebar } from '../../UI/sidebar/sidebar';
import { TaskCard } from '../task-card/task-card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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
  filterStatus = signal<'all' | 'pending' | 'completed'>('all');

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
