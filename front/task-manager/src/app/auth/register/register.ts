import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { AsyncPipe } from '@angular/common';

/**
 * Registration form component for creating new user accounts.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authService = inject(AuthService);
  registerForm: FormGroup;
  loading$ = this.authService.loading$;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  // Validador personalizado para confirmar contraseña
  /**
   * Ensures `password` and `confirmPassword` fields match.
   */
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Submits registration data and handles post-registration messaging.
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const { name, email, password } = this.registerForm.value;

    this.authService.signUp({ name, email, password }).subscribe({
      next: (response) => {
        this.successMessage = response.message;

        // Si no requiere confirmación, redirigir automáticamente
        if (response.message.includes('exitosamente')) {
          setTimeout(() => {
            this.router.navigate(['/tasks']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Register error:', error);
        this.errorMessage = error.message || 'Error al crear la cuenta';
      },
    });
  }

  // Getters para validación
  /**
   * Exposes the name control for template validation state.
   */
  get name() {
    return this.registerForm.get('name');
  }

  /**
   * Exposes the email control for template validation state.
   */
  get email() {
    return this.registerForm.get('email');
  }

  /**
   * Exposes the password control for template validation state.
   */
  get password() {
    return this.registerForm.get('password');
  }

  /**
   * Exposes the confirm-password control for template validation state.
   */
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
