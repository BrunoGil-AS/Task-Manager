import { Component, inject } from '@angular/core';
import { ErrorService, type AppErrorItem } from '../../core/errors/error.service';

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

  dismiss(id: string) {
    this.errorService.dismiss(id);
  }

  trackById(_index: number, item: AppErrorItem) {
    return item.id;
  }
}
