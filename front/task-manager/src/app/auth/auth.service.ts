import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import SupabaseService from '../supabase/supabase.service';
import { LoginCredentials, RegisterData, AuthUser } from './models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // BehaviorSubject para el usuario actual
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // BehaviorSubject para el estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    // Inicializar sesión al cargar la app
    this.initializeAuth();
  }

  /**
   * Inicializar autenticación y escuchar cambios
   */
  private initializeAuth(): void {
    // Restaurar sesión existente
    from(this.supabaseService.client.auth.getSession())
      .pipe(
        map(({ data: { session } }) => session),
        tap((session) => {
          if (session?.user) {
            this.setCurrentUser(session.user);
          }
        }),
      )
      .subscribe();

    // Escuchar cambios de autenticación
    this.supabaseService.client.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          this.setCurrentUser(session.user);
        } else {
          this.currentUserSubject.next(null);
        }

        // Manejar eventos específicos
        if (event === 'SIGNED_OUT') {
          this.router.navigate(['/auth/login']);
        }
      },
    );
  }

  /**
   * Establecer usuario actual
   */
  private setCurrentUser(user: User): void {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.['name'] || user.email,
    };
    this.currentUserSubject.next(authUser);
  }

  /**
   * Registrar nuevo usuario
   */
  signUp(data: RegisterData): Observable<{ success: boolean; message: string }> {
    this.loadingSubject.next(true);

    return from(
      this.supabaseService.client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      }),
    ).pipe(
      map(({ data: authData, error }) => {
        if (error) throw error;

        // Verificar si necesita confirmación por email
        if (authData.user && !authData.session) {
          return {
            success: true,
            message: 'Revisa tu email para confirmar tu cuenta',
          };
        }

        return {
          success: true,
          message: 'Cuenta creada exitosamente',
        };
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      }),
    );
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  signIn(credentials: LoginCredentials): Observable<{ success: boolean }> {
    this.loadingSubject.next(true);

    return from(
      this.supabaseService.client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;

        if (data.user) {
          this.setCurrentUser(data.user);
        }

        return { success: true };
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      }),
    );
  }

  /**
   * Cerrar sesión
   */
  signOut(): Observable<void> {
    this.loadingSubject.next(true);

    return from(this.supabaseService.client.auth.signOut()).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      tap(() => {
        this.currentUserSubject.next(null);
        this.loadingSubject.next(false);
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      }),
    );
  }

  /**
   * Obtener token de acceso actual
   */
  async getAccessToken(): Promise<string | null> {
    const {
      data: { session },
    } = await this.supabaseService.client.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Obtener usuario actual (síncrono)
   */
  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado (síncrono)
   */
  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  resetPassword(email: string): Observable<{ success: boolean; message: string }> {
    this.loadingSubject.next(true);

    return from(
      this.supabaseService.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      }),
    ).pipe(
      map(({ error }) => {
        if (error) throw error;

        return {
          success: true,
          message: 'Revisa tu email para restablecer tu contraseña',
        };
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      }),
    );
  }

  /**
   * Actualizar contraseña
   */
  updatePassword(newPassword: string): Observable<{ success: boolean }> {
    this.loadingSubject.next(true);

    return from(
      this.supabaseService.client.auth.updateUser({
        password: newPassword,
      }),
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        return { success: true };
      }),
      tap(() => this.loadingSubject.next(false)),
      catchError((error) => {
        this.loadingSubject.next(false);
        throw error;
      }),
    );
  }
}
