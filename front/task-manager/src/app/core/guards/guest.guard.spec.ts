import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { guestGuard } from './guest.guard';
import { AuthService } from '../../auth/auth.service';
import { AuthUser } from '../../auth/models/auth.model';

describe('guestGuard', () => {
  const user: AuthUser = {
    id: 'u1',
    email: 'a@a.com',
    name: 'Bruno',
  };

  const setup = (currentUser: AuthUser | null) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            initialized$: of(true),
            currentUser$: of(currentUser),
          },
        },
      ],
    });

    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true as unknown as boolean);

    return { navigateSpy };
  };

  it('should allow access when not authenticated', async () => {
    const { navigateSpy } = setup(null);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() => guestGuard()),
    );

    expect(result).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should redirect to home when authenticated', async () => {
    const { navigateSpy } = setup(user);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() => guestGuard()),
    );

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});
