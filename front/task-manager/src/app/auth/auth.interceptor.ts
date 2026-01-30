import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Solo agregar token a requests del backend
  if (!req.url.includes('localhost:3000') && !req.url.includes('tu-api.com')) {
    return next(req);
  }

  // Obtener token de forma asíncrona
  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      if (token) {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(clonedReq);
      }
      return next(req);
    }),
  );
};
