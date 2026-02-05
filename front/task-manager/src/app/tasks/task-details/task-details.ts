import { Component, inject, signal } from '@angular/core';
import { TaskService } from '../service/task-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../models/task.model';
import { DatePipe } from '@angular/common';
import { Sidebar } from '../../UI/sidebar/sidebar';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskForm } from '../task-form/task-form';
import { finalize, map, switchMap, tap } from 'rxjs';
//TODO: Generate documentation for the whole field and method of this class component.
@Component({
  selector: 'app-task-details',
  imports: [DatePipe, Sidebar, TaskForm],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails {
  // get the id from /task/details/:id
  showForm = signal<boolean>(false);
  loading = signal<boolean>(true);
  // get the task from the service
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
  // get the task from the service
  goBack() {
    this.router.navigate(['/tasks']);
  }

  toggleComplete() {
    this.task().completed = !this.task().completed;
    this.taskService.updateTask(this.task().id, this.task()).subscribe();
  }

  deleteTask() {
    this.taskService.deleteTask(this.task().id).subscribe();
  }

  isCompleted() {
    return this.task().completed;
  }

  createdAt() {
    return this.task().createdAt;
  }
  updatedAt() {
    return this.task().updatedAt;
  }

  taskDescription() {
    return this.task().description;
  }

  taskTitle() {
    return this.task().title;
  }
  goToDetails() {
    this.router.navigate(['/tasks/details', this.task().id]);
  }

  editTask() {
    this.showForm.set(true);
  }
  updateTask(task: Task) {
    this.taskService.updateTask(this.task().id, task).subscribe();
    this.showForm.set(false);
  }
}
