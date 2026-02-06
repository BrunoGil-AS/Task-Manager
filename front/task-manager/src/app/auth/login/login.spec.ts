import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loading$: of(false),
            signIn: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    component.loginForm.patchValue({ email: '', password: '' });

    component.onSubmit();

    expect(authService.signIn).not.toHaveBeenCalled();
  });

  it('should call authService.signIn and navigate on success', () => {
    (authService.signIn as any).mockReturnValue(of({ success: true }));
    component.loginForm.patchValue({ email: 'a@a.com', password: 'secret12' });

    component.onSubmit();

    expect(authService.signIn).toHaveBeenCalledWith({
      email: 'a@a.com',
      password: 'secret12',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should set errorMessage on signIn error', () => {
    (authService.signIn as any).mockReturnValue(throwError(() => new Error('Boom')));
    component.loginForm.patchValue({ email: 'a@a.com', password: 'secret12' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Boom');
  });
});
