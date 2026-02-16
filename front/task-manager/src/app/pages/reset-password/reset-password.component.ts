import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

/**
 * Password reset component for validating token fragments and updating password.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fragmentSubscription?: Subscription;

  recoveryToken: string | null = null;
  hashErrorMessage = '';
  apiErrorMessage = '';
  successMessage = '';
  isSubmitting = false;

  resetPasswordForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.passwordMatchValidator],
    },
  );

  /**
   * Subscribes to URL fragment updates to extract recovery tokens.
   */
  ngOnInit() {
    this.fragmentSubscription = this.route.fragment.subscribe((fragment) => {
      this.extractTokenFromFragment(fragment);
    });
  }

  /**
   * Cleans fragment subscription.
   */
  ngOnDestroy() {
    this.fragmentSubscription?.unsubscribe();
  }

  /**
   * Submits the new password using the recovery token.
   */
  onSubmit() {
    if (!this.recoveryToken) {
      this.apiErrorMessage = 'Invalid or expired reset link';
      return;
    }

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.apiErrorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const newPassword = (this.resetPasswordForm.value.password ?? '').toString();
    this.authService.resetPassword(this.recoveryToken, newPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Password updated successfully. Redirecting to login...';
        sessionStorage.setItem(
          'passwordResetSuccess',
          'Your password was updated successfully. Please sign in.',
        );
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1200);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.apiErrorMessage =
          this.getErrorMessage(error) || 'Could not update the password. Please try again.';
      },
    });
  }

  /**
   * Exposes password control for template validation state.
   */
  get passwordControl() {
    return this.resetPasswordForm.get('password');
  }

  /**
   * Exposes confirm-password control for template validation state.
   */
  get confirmPasswordControl() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  /**
   * Group validator ensuring password and confirmation match.
   */
  private passwordMatchValidator(group: {
    get(path: string): { value: unknown } | null;
  }): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Reads and validates recovery token from URL hash fragment.
   */
  private extractTokenFromFragment(fragment: string | null) {
    this.recoveryToken = null;
    this.hashErrorMessage = '';
    this.apiErrorMessage = '';

    if (!fragment) {
      this.hashErrorMessage = 'Invalid or expired reset link';
      return;
    }

    const params = new URLSearchParams(fragment);
    const fragmentError = params.get('error');
    if (fragmentError) {
      this.hashErrorMessage = this.mapFragmentError(params);
      return;
    }

    const token = params.get('access_token');
    if (!token) {
      this.hashErrorMessage = 'Invalid or expired reset link';
      return;
    }

    this.recoveryToken = token;
  }

  /**
   * Maps provider fragment errors to user-facing messages.
   */
  private mapFragmentError(params: URLSearchParams): string {
    const code = params.get('error_code');
    const description = decodeURIComponent(params.get('error_description') ?? '');

    if (code === 'otp_expired') {
      return 'This recovery link has expired. Request a new password reset email.';
    }

    if (description) {
      return description;
    }

    return 'Invalid or expired reset link';
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
