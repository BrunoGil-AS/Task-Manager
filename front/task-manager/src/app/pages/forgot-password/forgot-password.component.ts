import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

/**
 * Form component for requesting a password reset email.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AsyncPipe],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading$ = this.authService.loading$;
  errorMessage = '';
  successMessage = '';

  /**
   * Submits the forgot-password request.
   */
  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = (this.forgotPasswordForm.value.email ?? '').toString().trim();
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.successMessage = 'Check your email for the password reset link';
      },
      error: (error: unknown) => {
        this.errorMessage =
          this.getErrorMessage(error) || 'Could not send reset email. Please try again.';
      },
    });
  }

  /**
   * Exposes email control for template validation.
   */
  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }

  /**
   * Normalizes API/client errors to a displayable message.
   */
  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const apiError = error as { error?: { error?: string; message?: string } };
      return apiError.error?.error || apiError.error?.message || '';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return '';
  }
}
