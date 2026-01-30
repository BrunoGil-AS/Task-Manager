import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { map, take } from 'rxjs/operators';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        return true; // No autenticado, puede ver login
      }
      router.navigate(['/tasks']);
      return false;
    }),
  );
};
