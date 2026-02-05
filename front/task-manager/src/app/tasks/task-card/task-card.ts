import { Component, inject, input, output } from '@angular/core';
import { Task } from '../models/task.model';
import { DatePipe } from '@angular/common';
import { TaskService } from '../service/task-service';

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
  delete_ = output<number>();

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

  delete(id: number | null | undefined) {
    if (id == null) {
      return;
    }
    this.delete_.emit(id);
  }
}
