import { Component, input, output, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import type { AuthUser } from '../../auth/models/auth.model';

export interface ProfileFormValue {
  name: string;
  team?: string;
}

@Component({
  selector: 'app-user-profile-form',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class UserProfileForm {
  private fb = inject(FormBuilder);

  user = input.required<AuthUser>();
  onSave = output<ProfileFormValue>();
  onCancel = output<void>();

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      team: [''],
    });

    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.form.patchValue({
          name: currentUser.name || '',
          email: currentUser.email,
        });
      }
    });
  }

  cancel(): void {
    this.onCancel.emit();
    this.form.reset();
  }

  saveChanges(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.onSave.emit({
      name: value.name,
      team: value.team || undefined,
    });
  }
}
