import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AppConfigService);
    backend = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('applies the remote config', async () => {
    const done = service.load('/config/test.json');
    backend.expectOne((req) => req.url === '/config/test.json').flush({ apiBaseUrl: 'https://qa.example.com' });
    await done;
    expect(service.source()).toBe('remote');
    expect(service.config().apiBaseUrl).toBe('https://qa.example.com');
  });

  it('keeps defaults when the file is missing', async () => {
    const done = service.load('/config/test.json');
    backend.expectOne((req) => req.url === '/config/test.json').flush('not found', { status: 404, statusText: 'Not Found' });
    await done;
    expect(service.source()).toBe('defaults');
    expect(service.isEnabled('admin')).toBe(true);
    expect(service.warnings()[0]).toContain('could not load');
  });
});
