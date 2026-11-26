import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/tokens';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const token = signal<string | null>('abc123');
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.test' },
        { provide: AuthService, useValue: { token } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('adds the bearer token to API requests', () => {
    http.get('https://api.test/products').subscribe();
    const req = backend.expectOne('https://api.test/products');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
  });

  it('never sends the token to other hosts', () => {
    http.get('https://cdn.example.com/file.json').subscribe();
    const req = backend.expectOne('https://cdn.example.com/file.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
