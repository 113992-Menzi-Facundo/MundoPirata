import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces para las ubicaciones del estadio
export interface Location {
  id: number;
  name: string;
  capacity: number;
  price: number;
}

// Interfaces para los tickets
export interface Ticket {
  id: number;
  code: string;
  locationId: number;
  locationName: string;
  price: number;
  dateTime: string;
  eventTitle: string;
  available: boolean;
  createdAt: string;
}

export interface TicketCreate {
  locationId: number;
  price: number;
  dateTime: string;
  code?: string; // Opcional, se genera automáticamente si no se proporciona
}

// Interfaces para órdenes
export interface OrderItem {
  ticketId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderCreate {
  userId: number;
  orderItems: OrderItemCreate[];
  paymentMethod?: string;
}

export interface OrderItemCreate {
  ticketId: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  userName: string;
  totalAmount: number;
  purchaseDate: string;
  paymentMethod: string;
  paymentId?: string;
  purchaseState: 'pending' | 'approved' | 'rejected' | 'cancelled';
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// Interface para respuesta de pago de MercadoPago
export interface PaymentPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  clientId: string;
  publicKey: string;
  totalAmount: number;
  description: string;
  externalReference: string;
  notificationUrl: string;
  items: PaymentItem[];
}

export interface PaymentItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  categoryId: string;
}

// Interface para eventos con entradas disponibles
export interface EventWithTickets {
  eventId: number;
  eventTitle: string;
  eventDetail: string;
  eventDate: string;
  eventType: string;
  tickets: TicketsByLocation[];
}

export interface TicketsByLocation {
  location: Location;
  availableTickets: Ticket[];
  availableCount: number;
  soldCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // MÉTODOS PÚBLICOS (no requieren autenticación)
  // =====================================================

  /**
   * Obtener todas las entradas disponibles
   */
  getAllAvailableTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/public`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener entrada por ID
   */
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/tickets/public/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener entrada por código
   */
  getTicketByCode(code: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/tickets/public/code/${code}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener entradas disponibles por ubicación
   */
  getAvailableTicketsByLocation(locationId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/public/location/${locationId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener eventos con entradas disponibles agrupados por fecha
   */
  getEventsWithTickets(): Observable<EventWithTickets[]> {
    return this.http.get<EventWithTickets[]>(`${this.apiUrl}/tickets/public/events-with-tickets`)
      .pipe(catchError(this.handleError));
  }

  // =====================================================
  // MÉTODOS ADMINISTRATIVOS (requieren autenticación)
  // =====================================================

  /**
   * Crear nueva entrada (admin)
   */
  createTicket(ticketData: TicketCreate): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.post<Ticket>(`${this.apiUrl}/tickets`, ticketData, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener todas las entradas (admin)
   */
  getAllTickets(): Observable<Ticket[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets`, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener entradas por ubicación (admin)
   */
  getTicketsByLocation(locationId: number): Observable<Ticket[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/location/${locationId}`, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener cantidad de entradas disponibles por ubicación
   */
  getAvailableTicketsCountByLocation(locationId: number): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.get<number>(`${this.apiUrl}/tickets/stats/available/${locationId}`, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener cantidad de entradas vendidas
   */
  getSoldTicketsCount(): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.get<number>(`${this.apiUrl}/tickets/stats/sold`, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Marcar entrada como vendida
   */
  markTicketAsSold(ticketId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/tickets/${ticketId}/mark-sold`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Marcar entrada como disponible
   */
  markTicketAsAvailable(ticketId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/tickets/${ticketId}/mark-available`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar entrada
   */
  deleteTicket(ticketId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/tickets/${ticketId}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // =====================================================
  // MÉTODOS DE COMPRA Y ÓRDENES
  // =====================================================

  /**
   * Crear orden de compra
   */
  createOrder(orderData: OrderCreate): Observable<Order> {
    const headers = this.getAuthHeaders();
    return this.http.post<Order>(`${this.apiUrl}/orders`, orderData, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener orden por ID
   */
  getOrderById(orderId: number): Observable<Order> {
    const headers = this.getAuthHeaders();
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear preferencia de pago en MercadoPago
   */
  createPaymentPreference(ticketIds: number[], userEmail: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiUrl}/checkout-pro/tickets/preference?userEmail=${userEmail}`, 
      ticketIds, 
      { headers }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Enviar confirmación de pago por email
   */
  sendPaymentConfirmation(userEmail: string, paymentId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/test/simulate-payment-success?userEmail=${userEmail}&paymentId=${paymentId}`, 
      {}
    ).pipe(catchError(this.handleError));
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  /**
   * Generar título del evento basado en la fecha
   */
  private generateEventTitle(dateTime: string): string {
    const date = new Date(dateTime);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return `Partido del ${date.toLocaleDateString('es-AR', options)}`;
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear precio en pesos argentinos
   */
  formatPrice(price: number): string {
    if (price === 0) {
      return 'GRATIS';
    }
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    });
  }

  /**
   * Obtener headers de autenticación
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en TicketService:', error);
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 