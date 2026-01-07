import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { LoginRequest, AuthResponse, User, UserRegistration, UserUpdate } from './auth.interface';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadStoredUser();
  }

  // Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<{token: string}>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeToken(response.token);
        }),
        switchMap(response => {
          // Después del login exitoso, obtener los datos del usuario
          return this.getCurrentUser().pipe(
            tap(user => {
              this.storeUser(user);
              this.currentUserSubject.next(user);
            }),
            switchMap(user => {
              // Devolver la respuesta completa con token y usuario
              return new Observable<AuthResponse>(observer => {
                observer.next({
                  token: response.token,
                  user: user
                });
                observer.complete();
              });
            })
          );
        })
      );
  }

  // Logout
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.currentUserSubject.next(null);
  }

  // Registro
  register(userData: UserRegistration): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/register`, userData);
  }

  // Obtener usuario actual
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`);
  }

  // Actualizar usuario
  updateUser(userId: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${userId}`, userData)
      .pipe(
        tap(updatedUser => {
          const currentUser = this.currentUserSubject.value;
          if (currentUser && currentUser.id === userId) {
            this.storeUser(updatedUser);
            this.currentUserSubject.next(updatedUser);
          }
        })
      );
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  // Obtener usuario actual (síncrono)
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Verificar si es admin
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Manejo de token
  private storeToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('auth_token', token);
    }
  }

  private getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private removeToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('auth_token');
    }
  }

  // Manejo de usuario
  private storeUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  private removeUser(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('current_user');
    }
  }

  private loadStoredUser(): void {
    if (this.isBrowser()) {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          this.removeUser();
        }
      }
    }
  }

  // Obtener token para interceptores
  getAuthToken(): string | null {
    return this.getToken();
  }
} 