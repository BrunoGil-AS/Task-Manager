import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { filter, map, switchMap, take } from 'rxjs/operators';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Only allow guests after the initial session check completes.
  return authService.initialized$.pipe(
    filter((initialized) => initialized),
    take(1),
    switchMap(() => authService.currentUser$.pipe(take(1))),
    map((user) => {
      if (!user) {
        return true; // No autenticado, puede ver login
      }
      router.navigate(['/home']);
      return false;
    }),
  );
};
