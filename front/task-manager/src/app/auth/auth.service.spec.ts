import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { apiRoutes } from '../core/api-routes';

import { AuthService } from './auth.service';
import SupabaseService from '../supabase/supabase.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  const user: User = {
    id: 'u1',
    app_metadata: {},
    user_metadata: { name: 'Bruno' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email: 'a@a.com',
  } as User;

  const session: Session = {
    access_token: 'token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: 123,
    refresh_token: 'refresh',
    user,
  } as Session;

  const authState = {
    callback: null as null | ((event: AuthChangeEvent, session: Session | null) => void),
  };

  const authClient = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn((cb: any) => {
      authState.callback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  };

  const supabaseServiceStub = {
    client: {
      auth: authClient,
    },
  };

  beforeEach(() => {
    authClient.getSession.mockResolvedValue({ data: { session } });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseServiceStub },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize and set current user', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(service.currentUser?.id).toBe('u1');
  });

  it('should navigate to login on signed out', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    authState.callback?.('SIGNED_OUT', null);

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should sign up and return success message', async () => {
    authClient.signUp.mockResolvedValue({ data: { user, session: null }, error: null });

    const res = await firstValueFrom(
      service.signUp({ name: 'Bruno', email: 'a@a.com', password: 'secret12' }),
    );

    expect(res.success).toBe(true);
    expect(res.message).toContain('Revisa tu email');
  });

  it('should sign in and set user', async () => {
    authClient.signInWithPassword.mockResolvedValue({ data: { user }, error: null });

    const res = await firstValueFrom(service.signIn({ email: 'a@a.com', password: 'secret12' }));

    expect(res.success).toBe(true);
    expect(service.currentUser?.id).toBe('u1');
  });

  it('should sign out and navigate', async () => {
    authClient.signOut.mockResolvedValue({ error: null });

    await firstValueFrom(service.signOut());

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(service.currentUser).toBeNull();
  });

  it('should request password reset over backend API', async () => {
    const responsePromise = firstValueFrom(service.requestPasswordReset('a@a.com'));

    const req = httpMock.expectOne(apiRoutes.authForgotPassword);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@a.com' });
    req.flush({ success: true, message: 'Password reset email sent' });

    const res = await responsePromise;
    expect(res.success).toBe(true);
  });

  it('should reset password over backend API with recovery token', async () => {
    const responsePromise = firstValueFrom(service.resetPassword('recovery-token', 'newpass123'));

    const req = httpMock.expectOne(apiRoutes.authResetPassword);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ password: 'newpass123' });
    expect(req.request.headers.get('Authorization')).toBe('Bearer recovery-token');
    req.flush({ success: true, message: 'Password updated successfully' });

    const res = await responsePromise;
    expect(res.success).toBe(true);
  });
});
