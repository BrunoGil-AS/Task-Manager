import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only attach the session token for backend requests.
  if (!req.url.includes('localhost:3000') && !req.url.includes('tu-api.com')) {
    return next(req);
  }

  // Keep explicit Authorization headers (for password recovery token flow).
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(clonedReq);
    }),
  );
};
