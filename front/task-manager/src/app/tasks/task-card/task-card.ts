import { Component, input } from '@angular/core';
import { Task } from '../models/task.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  task = input<Task | null>(null);
  loading = input<boolean>(false);

  isCompleted() {
    return this.task()?.completed ?? false;
  }

  taskDate() {
    return this.task()?.createdAt;
  }

  taskDescription() {
    return this.task()?.description ?? '';
  }

  taskTitle() {
    return this.task()?.title ?? '';
  }
  goToDetails() {
    const task = this.task();
    if (!task) {
      return;
    }
    window.location.href = '/tasks/details/' + task.id;
  }
}
