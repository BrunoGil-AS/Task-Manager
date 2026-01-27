import { Component, input } from '@angular/core';
import Task from '../models/task.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-card',
  imports: [DatePipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  task = input.required<Task>();

  isCompleted() {
    return this.task().completed;
  }

  taskDate() {
    return this.task().createdAt;
  }

  taskDescription() {
    return this.task().description;
  }

  taskTitle() {
    return this.task().title;
  }
  goToDetails() {
    window.location.href = '/tasks/details/' + this.task().id;
  }
}
