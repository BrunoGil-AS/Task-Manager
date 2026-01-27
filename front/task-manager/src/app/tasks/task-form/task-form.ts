import { Component, input, model, output, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Task from '../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule], // 1. Importante: Agregar ReactiveFormsModule
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm {
  // Inyecciones
  private fb = inject(FormBuilder);

  // Inputs / Outputs
  task = input.required<Task>();
  showForm = model.required<boolean>();
  onSave = output<Task>(); // Evento para emitir la tarea editada al padre

  // Formulario Reactivo
  form: FormGroup;

  constructor() {
    // 2. Inicializar estructura del formulario
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      completed: [false],
      // Nota: ID y Fechas no se ponen aquí si son solo lectura,
      // o se ponen como { value: '', disabled: true }
    });

    // 3. Sincronizar: Cuando cambie el input 'task', actualizamos el formulario
    effect(() => {
      const currentTask = this.task();
      if (currentTask) {
        this.form.patchValue({
          title: currentTask.title,
          description: currentTask.description,
          completed: currentTask.completed,
        });
      }
    });
  }

  cancel() {
    this.showForm.set(false);
    this.form.reset(); // Opcional: limpiar formulario al cancelar
  }

  saveChanges() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Mostrar errores si faltan campos
      return;
    }

    // 4. Combinar la tarea original con los cambios del formulario
    const updatedTask: Task = {
      ...this.task(), // Mantiene ID y fechas originales
      ...this.form.value, // Sobrescribe título, descripción y estado
    };

    console.log('Guardando cambios:', updatedTask);

    // Emitir la tarea actualizada
    this.onSave.emit(updatedTask);
    this.showForm.set(false);
  }
}
