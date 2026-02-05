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

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private readonly errorItems = signal<AppErrorItem[]>([]);
  readonly errors = this.errorItems.asReadonly();

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

  dismiss(id: string) {
    this.errorItems.update((current) => current.filter((item) => item.id !== id));
  }

  clear() {
    this.errorItems.set([]);
  }

  private createId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `err_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
