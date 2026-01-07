import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces para las ubicaciones del mapa
export interface MapLocation {
  id: number;
  name: string;
  address: string;
  description: string;
  googleMapsUrl: string;
  authorId: number;
  authorName: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MapLocationCreate {
  name: string;
  address: string;
  description?: string;
  googleMapsUrl: string;
  authorId: number;
}

export interface MapLocationUpdate {
  name?: string;
  address?: string;
  description?: string;
  googleMapsUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapLocationService {
  private apiUrl = `${environment.apiUrl}/api/map-locations`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ============= MÉTODOS PÚBLICOS =============
  
  /**
   * Obtener todas las ubicaciones activas (público)
   */
  getAllActiveLocations(): Observable<MapLocation[]> {
    return this.http.get<MapLocation[]>(`${this.apiUrl}/public`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener una ubicación por ID (público)
   */
  getLocationById(id: number): Observable<MapLocation> {
    return this.http.get<MapLocation>(`${this.apiUrl}/public/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Buscar ubicaciones activas por texto (público)
   */
  searchActiveLocations(searchText: string): Observable<MapLocation[]> {
    return this.http.get<MapLocation[]>(`${this.apiUrl}/public/search?q=${encodeURIComponent(searchText)}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener estadísticas de ubicaciones activas (público)
   */
  getActiveLocationsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count`)
      .pipe(catchError(this.handleError));
  }

  // ============= MÉTODOS ADMINISTRATIVOS =============

  /**
   * Obtener todas las ubicaciones (admin)
   */
  getAllLocations(): Observable<MapLocation[]> {
    return this.http.get<MapLocation[]>(`${this.apiUrl}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear nueva ubicación (admin)
   */
  createLocation(locationData: MapLocationCreate): Observable<MapLocation> {
    return this.http.post<MapLocation>(`${this.apiUrl}`, locationData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar ubicación (admin)
   */
  updateLocation(id: number, locationData: MapLocationUpdate): Observable<MapLocation> {
    return this.http.put<MapLocation>(`${this.apiUrl}/${id}`, locationData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Cambiar estado de ubicación - ocultar/mostrar (admin)
   */
  toggleLocationState(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-state`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar ubicación (admin)
   */
  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener ubicaciones por autor (admin)
   */
  getLocationsByAuthor(authorId: number): Observable<MapLocation[]> {
    return this.http.get<MapLocation[]>(`${this.apiUrl}/author/${authorId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ============= UTILIDADES =============

  /**
   * Validar si una URL es de Google Maps
   */
  isValidGoogleMapsUrl(url: string): boolean {
    const googleMapsRegex = /.*maps\.google\.|.*goo\.gl\/maps|.*maps\.app\.goo\.gl.*/;
    return googleMapsRegex.test(url);
  }

  /**
   * Extraer coordenadas de una URL de Google Maps (si es posible)
   */
  extractCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
    // Patrones comunes para extraer coordenadas de URLs de Google Maps
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng
      /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/ // q=lat,lng
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
    }
    return null;
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Truncar texto para vista de lista
   */
  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en MapLocationService:', error);
    
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor';
    } else if (error.status === 401) {
      errorMessage = 'No tienes autorización para realizar esta acción';
    } else if (error.status === 403) {
      errorMessage = 'Acceso denegado';
    } else if (error.status === 404) {
      errorMessage = 'Ubicación no encontrada';
    } else if (error.status >= 500) {
      errorMessage = 'Error interno del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 