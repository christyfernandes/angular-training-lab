import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, switchMap, tap, timeout } from 'rxjs';
import { API_BASE_URL } from '../config/tokens';
import { SKIP_ERROR_HANDLING } from '../interceptors/error.interceptor';
import { LoginCredentials, LoginResponse, User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

/**
 * Authentication state backed by DummyJSON's JWT auth endpoints.
 *
 * Concepts:
 * - Private writable signals + public read-only signals and computed values.
 * - RxJS chaining with `switchMap`: log in, then load the full profile (which includes `role`).
 * - The token is attached to API calls by authInterceptor – this service never sets headers.
 *
 * Demo account: emilys / emilyspass (role: admin).
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(this.storage.get<string>(TOKEN_KEY));
  private readonly _user = signal<User | null>(this.storage.get<User>(USER_KEY));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly displayName = computed(() => {
    const user = this._user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  constructor() {
    effect(() => {
      const token = this._token();
      const user = this._user();
      if (token) this.storage.set(TOKEN_KEY, token);
      else this.storage.remove(TOKEN_KEY);
      if (user) this.storage.set(USER_KEY, user);
      else this.storage.remove(USER_KEY);
    });
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http
      .post<LoginResponse>(`${this.apiBase}/auth/login`, { ...credentials, expiresInMins: 60 })
      .pipe(
        tap((response) => this._token.set(response.accessToken)),
        // The token is now set, so authInterceptor adds it to this request automatically.
        switchMap(() => this.http.get<User>(`${this.apiBase}/auth/me`)),
        tap((user) => this._user.set(user)),
      );
  }

  /**
   * Startup check (called by AppInitService): is the stored token still valid?
   * - 401/403 → clear the session quietly; guards will then send the user to log in.
   * - Network error or timeout → keep the cached session; don't punish a slow network.
   */
  async restoreSession(): Promise<void> {
    if (!this._token()) return;
    try {
      const user = await firstValueFrom(
        this.http
          .get<User>(`${this.apiBase}/auth/me`, { context: new HttpContext().set(SKIP_ERROR_HANDLING, true) })
          .pipe(timeout(4000)),
      );
      this._user.set(user);
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        this.logout(false);
      }
    }
  }

  /** Clears the session. Pass `redirect: false` when the caller handles navigation. */
  logout(redirect = true): void {
    this._token.set(null);
    this._user.set(null);
    if (redirect) {
      void this.router.navigateByUrl('/');
    }
  }

  /** Refreshes the stored profile, e.g. after the account page loads it again. */
  updateUser(user: User): void {
    this._user.set(user);
  }

  /** Reads the `user` signal, so it is reactive when used in computed(), effect() or templates. */
  hasRole(...roles: UserRole[]): boolean {
    const role = this._user()?.role;
    return role !== undefined && roles.includes(role);
  }
}
