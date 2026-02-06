import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCard } from './task-card';
import type { Task } from '../models/task.model';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;
  const mockTask: Task = {
    id: 1,
    title: 'Task',
    description: 'Desc',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose task fields', () => {
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();

    expect(component.taskTitle()).toBe('Task');
    expect(component.taskDescription()).toBe('Desc');
    expect(component.isCompleted()).toBe(false);
  });

  it('should emit delete event when id is valid', () => {
    const emitSpy = vi.spyOn(component.delete_, 'emit');

    component.delete(1);

    expect(emitSpy).toHaveBeenCalledWith(1);
  });

  it('should not emit delete when id is null', () => {
    const emitSpy = vi.spyOn(component.delete_, 'emit');

    component.delete(null);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
