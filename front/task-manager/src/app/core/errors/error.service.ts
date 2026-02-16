import { Injectable, signal } from '@angular/core';

export type AppErrorType = 'error' | 'warning' | 'info';

export interface AppErrorItem {
  id: string;
  message: string;
  detail?: string;
  type: AppErrorType;
  status?: number;
  time: string;
}

/**
 * Global in-memory error notification service for UI toasts/panels.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private readonly errorItems = signal<AppErrorItem[]>([]);
  readonly errors = this.errorItems.asReadonly();

  /**
   * Adds a new error/notice item and optionally auto-dismisses it.
   */
  notify(
    message: string,
    options?: {
      detail?: string;
      type?: AppErrorType;
      status?: number;
      autoDismissMs?: number;
    },
  ) {
    const id = this.createId();
    const time = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const item: AppErrorItem = {
      id,
      message,
      detail: options?.detail,
      type: options?.type ?? 'error',
      status: options?.status,
      time,
    };

    this.errorItems.update((current) => [item, ...current].slice(0, 5));

    if (options?.autoDismissMs) {
      setTimeout(() => this.dismiss(id), options.autoDismissMs);
    }

    return id;
  }

  /**
   * Removes an error item by id.
   */
  dismiss(id: string) {
    this.errorItems.update((current) => current.filter((item) => item.id !== id));
  }

  /**
   * Clears all queued error items.
   */
  clear() {
    this.errorItems.set([]);
  }

  /**
   * Creates a stable id for each error notification item.
   */
  private createId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `err_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
