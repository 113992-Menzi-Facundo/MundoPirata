import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces
export interface Destination {
  id: number;
  name: string;
  address?: string;
  phoneNumber?: string;
  state: boolean;
}

export interface DonationCreateRequest {
  userId: number;
  destinationId: number;
  amount: number;
  paymentMethod?: string;
}

export interface DonationResponse {
  id: number;
  userId: number;
  userName: string;
  destinationId: number;
  destinationName: string;
  destinationAddress?: string;
  amount: number;
  donationDate: string;
  paymentMethod: string;
  paymentId?: string;
  purchaseState: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPreferenceResponse {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  clientId: string;
  publicKey: string;
  totalAmount: number;
  currency: string;
  description: string;
  externalReference: string;
  notificationUrl: string;
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  monthlyAmount: number;
  avgDonation: number;
  destinationStats: {
    destination: string;
    amount: number;
    count: number;
  }[];
}

export interface DestinationCreateRequest {
  name: string;
  address?: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los destinos de donación disponibles (públicos)
   */
  getDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.apiUrl}/destinations/public`).pipe(
      catchError(this.handleError)
    );
  }

  // ========== MÉTODOS ADMINISTRATIVOS ==========

  /**
   * Obtener todas las donaciones (admin)
   */
  getAllDonations(): Observable<DonationResponse[]> {
    const headers = this.getHeaders();
    return this.http.get<DonationResponse[]>(`${this.apiUrl}/donations`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todas las destinaciones (admin)
   */
  getAllDestinations(): Observable<Destination[]> {
    const headers = this.getHeaders();
    return this.http.get<Destination[]>(`${this.apiUrl}/destinations`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear nueva destinación (admin)
   */
  createDestination(destination: DestinationCreateRequest): Observable<Destination> {
    const headers = this.getHeaders();
    return this.http.post<Destination>(`${this.apiUrl}/destinations`, destination, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar destinación (admin)
   */
  updateDestination(id: number, destination: Destination): Observable<Destination> {
    const headers = this.getHeaders();
    return this.http.put<Destination>(`${this.apiUrl}/destinations/${id}`, destination, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cambiar estado de destinación (admin)
   */
  toggleDestinationState(id: number): Observable<Destination> {
    const headers = this.getHeaders();
    return this.http.put<Destination>(`${this.apiUrl}/destinations/${id}/toggle`, {}, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar destinación (admin)
   */
  deleteDestination(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/destinations/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener estadísticas de donaciones (admin)
   */
  getDonationStatistics(): Observable<DonationStats> {
    const headers = this.getHeaders();
    return this.http.get<DonationStats>(`${this.apiUrl}/destinations/stats`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear una nueva donación
   */
  createDonation(donationData: DonationCreateRequest): Observable<DonationResponse> {
    const headers = this.getHeaders();
    
    return this.http.post<DonationResponse>(
      `${this.apiUrl}/donations`,
      donationData,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener donación por ID
   */
  getDonationById(donationId: number): Observable<DonationResponse> {
    const headers = this.getHeaders();
    
    return this.http.get<DonationResponse>(
      `${this.apiUrl}/donations/${donationId}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener donaciones del usuario actual
   */
  getUserDonations(userId: number): Observable<DonationResponse[]> {
    const headers = this.getHeaders();
    
    return this.http.get<DonationResponse[]>(
      `${this.apiUrl}/donations/user/${userId}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear preferencia de pago para una donación
   */
  createPaymentPreference(donationId: number): Observable<any> {
    const headers = this.getHeaders();
    
    return this.http.post<any>(
      `${this.apiUrl}/checkout-pro/donations/${donationId}/preference`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Procesar donación después del pago exitoso
   */
  processDonation(donationId: number, paymentStatus: string, paymentId?: string): Observable<string> {
    const headers = this.getHeaders();
    let params = new URLSearchParams({
      donationId: donationId.toString(),
      paymentStatus: paymentStatus
    });

    if (paymentId) {
      params.append('paymentId', paymentId);
    }

    return this.http.post<string>(
      `${this.apiUrl}/donations/process-donation?${params.toString()}`,
      {},
      { headers, responseType: 'text' as 'json' }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Formatear precio en pesos argentinos
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Validar monto de donación
   */
  validateDonationAmount(amount: number): { valid: boolean; message?: string } {
    if (!amount || amount <= 0) {
      return { valid: false, message: 'El monto debe ser mayor a cero' };
    }
    
    if (amount < 100) {
      return { valid: false, message: 'El monto mínimo es de $100' };
    }
    
    if (amount > 1000000) {
      return { valid: false, message: 'El monto máximo es de $1.000.000' };
    }
    
    return { valid: true };
  }

  /**
   * Obtener headers HTTP con autenticación
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en DonationService:', error);
    
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'No tienes autorización para realizar esta acción';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error HTTP ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 