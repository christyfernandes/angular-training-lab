import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const isAuthenticated = signal(false);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated } }],
    });
  });

  // Functional guards need an injection context to call inject().
  // CanMatchFn receives (route, segments, currentSnapshot); the guard only uses segments.
  const run = (path: string) =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as Route, [new UrlSegment(path, {})], {} as Parameters<typeof authGuard>[2]),
    );

  it('lets signed-in users through', () => {
    isAuthenticated.set(true);
    expect(run('account')).toBe(true);
  });

  it('redirects guests to /login with a returnUrl', () => {
    isAuthenticated.set(false);
    const result = run('account') as UrlTree;
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Faccount');
  });
});
