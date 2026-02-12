import { environment } from '../core/environment';

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

describe('SupabaseService', () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create supabase client with auth security options', async () => {
    const fakeClient = { auth: {} } as any;
    createClientMock.mockReturnValue(fakeClient);

    const { SupabaseService } = await import('./supabase.service');

    const service = new SupabaseService();

    expect(createClientMock).toHaveBeenCalledTimes(1);
    const [url, key, options] = createClientMock.mock.calls[0] as [
      string,
      string,
      {
        auth: {
          storage: Storage;
          persistSession: boolean;
          autoRefreshToken: boolean;
          detectSessionInUrl: boolean;
        };
      },
    ];

    expect(url).toBe(environment.supabaseUrl);
    expect(key).toBe(environment.supabaseKey);
    expect(options.auth.storage).toBe(sessionStorage);
    expect(options.auth.persistSession).toBe(true);
    expect(options.auth.autoRefreshToken).toBe(true);
    expect(options.auth.detectSessionInUrl).toBe(true);
    expect(service.client).toBe(fakeClient);
  });
});
