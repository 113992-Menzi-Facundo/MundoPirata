import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  // Obtener el token del servicio de autenticación
  const token = authService.getAuthToken();

  // Si hay token, agregarlo al header Authorization
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continuar con la petición y manejar errores
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Unauthorized), hacer logout y redirigir
      if (error.status === 401) {
        authService.logout();
        notificationService.warning(
          'Sesión expirada',
          'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.'
        );
        router.navigate(['/auth/login']);
      }
      
      // Si el error es 403 (Forbidden), redirigir a home
      if (error.status === 403) {
        notificationService.warning(
          'Acceso denegado',
          'No tienes permisos para acceder a este recurso.'
        );
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
} 