import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskForm } from './task-form';
import type { Task } from '../models/task.model';

describe('TaskForm', () => {
  let component: TaskForm;
  let fixture: ComponentFixture<TaskForm>;
  const baseTask: Task = {
    id: 1,
    title: 'Task',
    description: 'Desc',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', baseTask);
    fixture.componentRef.setInput('showForm', true);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit when form is invalid', () => {
    const emitSpy = vi.spyOn(component.onSave, 'emit');
    component.form.patchValue({ title: '' });

    component.saveChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should emit updated task when form is valid', () => {
    const emitSpy = vi.spyOn(component.onSave, 'emit');
    component.form.patchValue({
      title: 'Updated',
      description: 'New desc',
      completed: true,
    });

    component.saveChanges();

    expect(emitSpy).toHaveBeenCalled();
    const emittedTask = (emitSpy as any).mock.calls.at(-1)?.[0] as Task;
    expect(emittedTask.id).toBe(1);
    expect(emittedTask.title).toBe('Updated');
    expect(emittedTask.description).toBe('New desc');
    expect(emittedTask.completed).toBe(true);
    expect(component.showForm()).toBe(false);
  });

  it('should reset and hide form on cancel', () => {
    component.form.patchValue({
      title: 'Updated',
      description: 'New desc',
      completed: true,
    });

    component.cancel();

    expect(component.showForm()).toBe(false);
    expect(component.form.value.title ?? '').toBe('');
  });
});
