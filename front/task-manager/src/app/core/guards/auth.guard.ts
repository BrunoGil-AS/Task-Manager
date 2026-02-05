import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { filter, map, switchMap, take } from 'rxjs/operators';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Waits for session initialization before evaluating the current user.
  // This prevents false redirects when the app is reloaded and the session
  // is still being restored asynchronously.
  return authService.initialized$.pipe(
    filter((initialized) => initialized),
    take(1),
    switchMap(() => authService.currentUser$.pipe(take(1))),
    map((user) => {
      if (user) {
        return true; // Usuario autenticado
      }
      router.navigate(['/auth/login']);
      return false;
    }),
  );
};
