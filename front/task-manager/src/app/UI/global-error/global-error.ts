import { Component, inject } from '@angular/core';
import { ErrorService, type AppErrorItem } from '../../core/errors/error.service';

/**
 * Global error list component bound to `ErrorService` notifications.
 */
@Component({
  selector: 'app-global-error',
  standalone: true,
  imports: [],
  templateUrl: './global-error.html',
  styleUrl: './global-error.css',
})
export class GlobalError {
  private readonly errorService = inject(ErrorService);
  protected readonly errors = this.errorService.errors;

  /**
   * Dismisses one error notification.
   */
  dismiss(id: string) {
    this.errorService.dismiss(id);
  }

  /**
   * TrackBy helper to minimize list re-rendering.
   */
  trackById(_index: number, item: AppErrorItem) {
    return item.id;
  }
}
