import { TaskService } from './../service/task-service';
import { Component, inject, signal } from '@angular/core';
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

  private resetCreateForm() {
    this.createForm.reset({
      title: '',
      description: '',
      completed: false,
    });
  }
}
