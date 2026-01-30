import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { take, map } from 'rxjs/operators';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a que currentUser$ emita un valor
  return authService.currentUser$.pipe(
    take(1), // Solo toma el primer valor
    map((user) => {
      if (user) {
        return true; // Usuario autenticado
      }
      router.navigate(['/auth/login']);
      return false;
    }),
  );
};
