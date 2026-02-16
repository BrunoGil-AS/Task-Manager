import { Component, inject, signal } from '@angular/core';
import { TaskService } from '../service/task-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../models/task.model';
import { DatePipe } from '@angular/common';
import { Sidebar } from '../../UI/sidebar/sidebar';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskForm } from '../task-form/task-form';
import { finalize, map, switchMap, tap } from 'rxjs';

/**
 * Task details page for viewing and editing a single task record.
 */
@Component({
  selector: 'app-task-details',
  imports: [DatePipe, Sidebar, TaskForm],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails {
  /**
   * Controls edit-form visibility.
   */
  showForm = signal<boolean>(false);
  /**
   * Tracks loading state while resolving route task data.
   */
  loading = signal<boolean>(true);
  /**
   * Task data service dependency.
   */
  taskService = inject(TaskService);

  private router = inject(Router);

  private route = inject(ActivatedRoute);
  task$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    tap(() => {
      this.loading.set(true);
      this.showForm.set(false);
    }),
    switchMap((id) => this.taskService.getTask(id).pipe(finalize(() => this.loading.set(false)))),
  );
  task = toSignal(this.task$, { initialValue: {} as Task });
  /**
   * Navigates back to the task list.
   */
  goBack() {
    this.router.navigate(['/tasks']);
  }

  /**
   * Toggles completion and persists the update.
   */
  toggleComplete() {
    this.task().completed = !this.task().completed;
    this.taskService.updateTask(this.task().id, this.task()).subscribe();
  }

  /**
   * Deletes current task.
   */
  deleteTask() {
    this.taskService.deleteTask(this.task().id).subscribe();
  }

  /**
   * Returns current completion state.
   */
  isCompleted() {
    return this.task().completed;
  }

  /**
   * Returns current task creation timestamp.
   */
  createdAt() {
    return this.task().createdAt;
  }
  /**
   * Returns current task update timestamp.
   */
  updatedAt() {
    return this.task().updatedAt;
  }

  /**
   * Returns current task description.
   */
  taskDescription() {
    return this.task().description;
  }

  /**
   * Returns current task title.
   */
  taskTitle() {
    return this.task().title;
  }
  /**
   * Navigates to this task's details route.
   */
  goToDetails() {
    this.router.navigate(['/tasks/details', this.task().id]);
  }

  /**
   * Opens the inline edit form.
   */
  editTask() {
    this.showForm.set(true);
  }
  /**
   * Persists edited task fields and closes the form.
   */
  updateTask(task: Task) {
    this.taskService.updateTask(this.task().id, task).subscribe();
    this.showForm.set(false);
  }
}
