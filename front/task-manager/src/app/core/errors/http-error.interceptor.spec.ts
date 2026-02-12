import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ErrorService } from './error.service';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const errorServiceStub = {
    notify: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ErrorService, useValue: errorServiceStub },
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorServiceStub.notify.mockClear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should notify session expired message on 401', () => {
    http.get('/api/secure').subscribe({
      next: () => {
        throw new Error('Expected request to fail');
      },
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/api/secure');
    req.flush(
      { message: 'token expired' },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    const [message, options] = errorServiceStub.notify.mock.calls[0];
    expect(message).toContain('sesi');
    expect(options.status).toBe(401);
  });

  it('should notify no-permission message on 403', () => {
    http.get('/api/forbidden').subscribe({
      next: () => {
        throw new Error('Expected request to fail');
      },
      error: (error) => {
        expect(error.status).toBe(403);
      },
    });

    const req = httpMock.expectOne('/api/forbidden');
    req.flush(
      { message: 'forbidden' },
      {
        status: 403,
        statusText: 'Forbidden',
      },
    );

    const [message, options] = errorServiceStub.notify.mock.calls[0];
    expect(message).toContain('permis');
    expect(options.status).toBe(403);
  });
});
