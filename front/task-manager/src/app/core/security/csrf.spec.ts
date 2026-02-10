import { HttpClient, withXsrfConfiguration, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

/**
 * This test suite verifies that Angular's built-in XSRF protection is correctly configured and functioning.
 * It checks that the expected XSRF token is read from cookies and included in the appropriate HTTP requests.
 */

describe('CSRF protection', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Seed the expected XSRF cookie for Angular to read.
    document.cookie = 'XSRF-TOKEN=csrf-token-value; path=/';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          // Align with app-level XSRF configuration.
          withXsrfConfiguration({
            cookieName: 'XSRF-TOKEN',
            headerName: 'X-XSRF-TOKEN',
          }),
        ),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    // Clear the cookie to avoid cross-test contamination.
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
  });

  it('adds XSRF header on mutating requests', () => {
    httpClient.post('/api/test', { ok: true }).subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-token-value');
    req.flush({ ok: true });
  });

  it('does not add XSRF header on GET requests', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
    req.flush({ ok: true });
  });
});
