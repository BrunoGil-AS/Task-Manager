import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

import { AuthService } from './auth.service';
import SupabaseService from '../supabase/supabase.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

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
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  };

  const supabaseServiceStub = {
    client: {
      auth: authClient,
    },
  };

  beforeEach(() => {
    authClient.getSession.mockResolvedValue({ data: { session } });
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseServiceStub },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
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

    const res = await firstValueFrom(
      service.signIn({ email: 'a@a.com', password: 'secret12' }),
    );

    expect(res.success).toBe(true);
    expect(service.currentUser?.id).toBe('u1');
  });

  it('should sign out and navigate', async () => {
    authClient.signOut.mockResolvedValue({ error: null });

    await firstValueFrom(service.signOut());

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(service.currentUser).toBeNull();
  });

  it('should send reset password email', async () => {
    authClient.resetPasswordForEmail.mockResolvedValue({ error: null });

    const res = await firstValueFrom(service.resetPassword('a@a.com'));

    expect(res.success).toBe(true);
  });

  it('should update password', async () => {
    authClient.updateUser.mockResolvedValue({ error: null });

    const res = await firstValueFrom(service.updatePassword('newpass'));

    expect(res.success).toBe(true);
  });
});
