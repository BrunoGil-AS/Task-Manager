import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { GlobalError } from './global-error';
import { ErrorService, type AppErrorItem } from '../../core/errors/error.service';

describe('GlobalError', () => {
  let component: GlobalError;
  let fixture: ComponentFixture<GlobalError>;
  const errorsSignal = signal<AppErrorItem[]>([]);
  const errorServiceStub = {
    errors: errorsSignal.asReadonly(),
    dismiss: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalError],
      providers: [{ provide: ErrorService, useValue: errorServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalError);
    component = fixture.componentInstance;
    errorsSignal.set([]);
    errorServiceStub.dismiss.mockClear();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render error messages from service', async () => {
    errorsSignal.set([
      {
        id: 'err_1',
        message: 'No tienes permisos',
        detail: 'Denied by API',
        type: 'error',
        status: 403,
        time: '10:30',
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-title')?.textContent).toContain(
      'No tienes permisos',
    );
    expect(compiled.querySelector('.error-detail')?.textContent).toContain(
      'Denied by API',
    );
    expect(compiled.querySelector('.error-status')?.textContent).toContain(
      'HTTP 403',
    );
  });

  it('should dismiss an error when close button is clicked', async () => {
    errorsSignal.set([
      {
        id: 'err_2',
        message: 'Session expired',
        type: 'error',
        status: 401,
        time: '11:00',
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.error-dismiss') as HTMLButtonElement;
    button.click();

    expect(errorServiceStub.dismiss).toHaveBeenCalledWith('err_2');
  });
});
