import { Component, inject, signal } from '@angular/core';
import { TaskService } from '../service/task-service';
import { toSignal } from '@angular/core/rxjs-interop';
import Task from '../models/task.model';
import { DatePipe } from '@angular/common';
import { Sidebar } from '../../UI/sidebar/sidebar';
import { OutletContext } from '@angular/router';
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'app-task-details',
  imports: [DatePipe, Sidebar, TaskForm],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails {
  // get the id from /task/details/:id
  showForm = signal<boolean>(false);
  id = window.location.pathname.split('/')[3];
  // get the task from the service
  taskService = inject(TaskService);
  task$ = this.taskService.getTask(Number(this.id));
  task = toSignal(this.task$, { initialValue: {} as Task });
  // get the task from the service
  goBack() {
    window.location.href = '/tasks';
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
    window.location.href = '/tasks/' + this.task().id;
  }

  editTask() {
    this.showForm.set(true);
  }
  updateTask(task: Task) {
    this.taskService.updateTask(this.task().id, task).subscribe();
    this.showForm.set(false);
  }
}
