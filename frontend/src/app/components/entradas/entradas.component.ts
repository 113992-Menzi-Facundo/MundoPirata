import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { TicketService, EventWithTickets, TicketsByLocation, Ticket } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

interface CartItem {
  ticket: Ticket;
  quantity: number;
  subtotal: number;
}

interface StadiumSection {
  id: number;
  name: string;
  capacity: number;
  basePrice: number;
  available: boolean;
  availableCount: number;
  soldOut: boolean;
}

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entradas.component.html',
  styleUrls: ['./entradas.component.css']
})
export class EntradasComponent implements OnInit, OnDestroy {
  // Estados de vista
  showStadiumSections = false;
  showCart = false;
  isLoading = false;
  error: string | null = null;
  
  // Datos
  eventsWithTickets: EventWithTickets[] = [];
  selectedEvent: EventWithTickets | null = null;
  cart: CartItem[] = [];
  
  // Filtros y búsqueda
  searchTerm = '';
  selectedPriceRange = '';
  showOnlyAvailable = true;
  
  // Manejo de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private ticketService: TicketService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar si volvemos de MercadoPago
    this.checkPaymentReturn();
    this.checkPendingPayments();
    this.loadEventsWithTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar eventos con entradas disponibles
   */
  loadEventsWithTickets(): void {
    this.isLoading = true;
    this.error = null;

    this.ticketService.getEventsWithTickets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          console.log('📊 Eventos cargados:', events);
          this.eventsWithTickets = events;
          this.isLoading = false;
          
          if (events.length === 0) {
            console.log('⚠️ No hay eventos disponibles');
            this.notificationService.info(
              'Sin eventos disponibles',
              'No hay eventos con entradas disponibles en este momento.'
            );
          }
        },
        error: (error) => {
          console.error('❌ Error cargando eventos:', error);
          this.error = 'Error al cargar los eventos. Intenta nuevamente.';
          this.isLoading = false;
          this.loadFallbackData();
        }
      });
  }

  /**
   * Verificar si el usuario volvió de MercadoPago
   */
  private checkPaymentReturn(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const paymentStatus = params['payment'];
      const paymentId = params['payment_id'];
      const preferenceId = params['preference_id'];
      const userEmail = params['userEmail'];
      const ticketIds = params['ticketIds'];
      
      if (paymentStatus && userEmail && ticketIds) {
        this.handlePaymentReturn(paymentStatus, paymentId, preferenceId, userEmail, ticketIds);
      }
    });
  }

  /**
   * Verificar pagos pendientes al cargar la página
   */
  private checkPendingPayments(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // No ejecutar en servidor
    }
    
    const pendingPayment = localStorage.getItem('mundoPirata_pendingPayment');
    if (pendingPayment) {
      try {
        const paymentInfo = JSON.parse(pendingPayment);
        const timeElapsed = Date.now() - new Date(paymentInfo.timestamp).getTime();
        
        // Si han pasado más de 2 minutos, preguntar por el estado
        if (timeElapsed > 120000 && !paymentInfo.processed) { // 2 minutos
          setTimeout(() => {
            this.verifyAndProcessPayment(paymentInfo.ticketIds, paymentInfo.userEmail);
          }, 2000);
        }
      } catch (error) {
        console.error('Error verificando pagos pendientes:', error);
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('mundoPirata_pendingPayment');
        }
      }
    }
  }

  /**
   * Manejar el retorno desde MercadoPago
   */
  private handlePaymentReturn(status: string, paymentId: string, preferenceId: string, userEmail: string, ticketIds: string): void {
    switch (status) {
      case 'success':
      case 'approved':
        // Procesar la compra automáticamente
        this.processCompletedPurchase(userEmail, ticketIds, status);
        
        this.notificationService.success(
          '¡Pago Aprobado! 🎉',
          'Tu compra fue procesada exitosamente. Se envió la confirmación a tu email.'
        );
        break;
        
      case 'failure':
        this.notificationService.error(
          'Pago Rechazado ❌',
          'Tu pago no pudo ser procesado. Intenta nuevamente con otro medio de pago.'
        );
        break;
        
      case 'pending':
        this.notificationService.warning(
          'Pago Pendiente ⏳',
          'Tu pago está siendo verificado. Te notificaremos por email cuando se confirme.'
        );
        break;
    }
    
    // Limpiar los parámetros de la URL y recargar disponibilidad
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Recargar eventos para actualizar disponibilidad
      this.loadEventsWithTickets();
    }, 3000);
  }

  /**
   * Procesar compra completada - Actualizar disponibilidad y enviar email
   */
  private processCompletedPurchase(userEmail: string, ticketIds: string, paymentStatus: string): void {
    // Llamar al backend para procesar la compra
    const params = new URLSearchParams({
      userEmail: userEmail,
      ticketIds: ticketIds,
      paymentStatus: paymentStatus
    });

    fetch(`http://localhost:8080/api/orders/process-purchase?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.text())
    .then(result => {
      console.log('Compra procesada exitosamente:', result);
      
      // Vaciar carrito silenciosamente
      this.vaciarCarrito(true);
    })
    .catch(error => {
      console.error('Error procesando compra:', error);
    });
  }

  /**
   * Mostrar mensaje de procesamiento de pago
   */
  private showPaymentProcessingMessage(ticketIds: number[], userEmail: string): void {
    this.notificationService.confirm(
      '🔄 Procesando Pago',
      `<div class="text-center">
        <p><strong>¡Pago en proceso!</strong></p>
        <p>Tu compra está siendo procesada en MercadoPago.</p>
        <p>📧 Te llegará un email de confirmación cuando se complete el pago.</p>
        <p>🎫 Si cerraste la ventana de MercadoPago y ya pagaste, haz clic en "Ya pagué" para verificar tu pago.</p>
      </div>`,
      'Ya pagué',
      'Entendido'
    ).then((result) => {
      if (result.isConfirmed) {
        // Usuario dice que ya pagó, verificar pago
        this.verifyAndProcessPayment(ticketIds, userEmail);
      } else {
        // Usuario entendió, verificar después de un tiempo
        setTimeout(() => {
          this.checkPendingPaymentOnFocus();
        }, 5000);
      }
    });
  }

  /**
   * Verificar y procesar pago manualmente
   */
  private verifyAndProcessPayment(ticketIds: number[], userEmail: string): void {
    this.notificationService.confirm(
      '✅ Confirmar Pago',
      `<div class="text-center">
        <p>¿Completaste el pago en MercadoPago?</p>
        <p class="text-warning">⚠️ Solo confirma si realmente pagaste</p>
      </div>`,
      'Sí, ya pagué',
      'No, cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        // Procesar el pago como exitoso
        const ticketIdsStr = ticketIds.join(',');
        this.processCompletedPurchase(userEmail, ticketIdsStr, 'success');
        
        // Limpiar pago pendiente
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('mundoPirata_pendingPayment');
        }
        
        // Mostrar éxito
        this.notificationService.success(
          '¡Pago Confirmado! 🎉',
          'Tu compra fue procesada exitosamente. Se envió la confirmación a tu email.'
        );
        
        // Recargar datos
        this.loadEventsWithTickets();
      }
    });
  }

  /**
   * Verificar pagos pendientes cuando la ventana toma foco
   */
  private checkPendingPaymentOnFocus(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // No ejecutar en servidor
    }
    
    const handleFocus = () => {
      const pendingPayment = localStorage.getItem('mundoPirata_pendingPayment');
      if (pendingPayment) {
        try {
          const paymentInfo = JSON.parse(pendingPayment);
          if (!paymentInfo.processed) {
            // Preguntar si el usuario completó el pago
            setTimeout(() => {
              this.verifyAndProcessPayment(paymentInfo.ticketIds, paymentInfo.userEmail);
            }, 1000);
          }
        } catch (error) {
          console.error('Error parsing pending payment:', error);
        }
      }
      window.removeEventListener('focus', handleFocus);
    };
    
    window.addEventListener('focus', handleFocus);
  }

  /**
   * Enviar email de confirmación de compra
   */
  private sendConfirmationEmail(userEmail: string, paymentId: string): void {
    this.ticketService.sendPaymentConfirmation(userEmail, paymentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Email de confirmación enviado exitosamente');
        },
        error: (error: any) => {
          console.error('Error enviando email de confirmación:', error);
        }
      });
  }

  /**
   * Obtener los cuatro sectores del estadio con disponibilidad
   */
  getStadiumSections(event: EventWithTickets): StadiumSection[] {
    const allSections: StadiumSection[] = [
      { id: 1, name: 'Popular Pirata', capacity: 15000, basePrice: 8000, available: false, availableCount: 0, soldOut: true },
      { id: 2, name: 'Popular Preferencial', capacity: 8000, basePrice: 12000, available: false, availableCount: 0, soldOut: true },
      { id: 3, name: 'Platea Cuéllar', capacity: 5000, basePrice: 18000, available: false, availableCount: 0, soldOut: true },
      { id: 4, name: 'Platea Heredia', capacity: 1000, basePrice: 18000, available: false, availableCount: 0, soldOut: true }
    ];

    // Actualizar con datos reales del evento
    event.tickets.forEach(ticketLocation => {
      const section = allSections.find(s => s.id === ticketLocation.location.id);
      if (section) {
        section.name = ticketLocation.location.name; // Usar nombre dinámico del backend
        section.available = ticketLocation.availableCount > 0;
        section.availableCount = ticketLocation.availableCount;
        section.soldOut = ticketLocation.availableCount === 0;
        section.basePrice = ticketLocation.location.price;
        section.capacity = ticketLocation.location.capacity;
      }
    });

    return allSections;
  }

  /**
   * Verificar si un sector está agotado
   */
  isSectionSoldOut(event: EventWithTickets, sectionId: number): boolean {
    const section = this.getStadiumSections(event).find(s => s.id === sectionId);
    return section ? section.soldOut : true;
  }

  /**
   * Obtener la ubicación de tickets para un sector específico
   */
  getTicketLocationForSection(event: EventWithTickets, sectionId: number): TicketsByLocation | null {
    return event.tickets.find(t => t.location.id === sectionId) || null;
  }

  /**
   * Datos de respaldo si falla la conexión
   */
  private loadFallbackData(): void {
    this.eventsWithTickets = [
      {
        eventId: 1,
        eventTitle: 'Belgrano vs River Plate',
        eventDetail: 'Partido por la Liga Profesional Argentina - Fecha 15',
        eventDate: '2025-01-15T21:00:00',
        eventType: 'Partido',
        tickets: [
          {
            location: { id: 1, name: 'Popular Pirata', capacity: 15000, price: 8000 },
            availableTickets: [
              { id: 1, code: 'BEL-PP-001', locationId: 1, locationName: 'Popular Pirata', price: 8000, dateTime: '2025-01-15T21:00:00', eventTitle: 'Belgrano vs River Plate', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 2, code: 'BEL-PP-002', locationId: 1, locationName: 'Popular Pirata', price: 8000, dateTime: '2025-01-15T21:00:00', eventTitle: 'Belgrano vs River Plate', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 3, code: 'BEL-PP-003', locationId: 1, locationName: 'Popular Pirata', price: 8000, dateTime: '2025-01-15T21:00:00', eventTitle: 'Belgrano vs River Plate', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 150,
            soldCount: 200
          },
          {
            location: { id: 2, name: 'Popular Preferencial', capacity: 8000, price: 12000 },
            availableTickets: [
              { id: 4, code: 'BEL-PPF-001', locationId: 2, locationName: 'Popular Preferencial', price: 12000, dateTime: '2025-01-15T21:00:00', eventTitle: 'Belgrano vs River Plate', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 5, code: 'BEL-PPF-002', locationId: 2, locationName: 'Popular Preferencial', price: 12000, dateTime: '2025-01-15T21:00:00', eventTitle: 'Belgrano vs River Plate', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 80,
            soldCount: 120
          }
        ]
      },
      {
        eventId: 2,
        eventTitle: 'Belgrano vs Boca Juniors',
        eventDetail: 'Superclásico - Liga Profesional Argentina',
        eventDate: '2025-02-15T21:00:00',
        eventType: 'Partido',
        tickets: [
          {
            location: { id: 1, name: 'Popular Pirata', capacity: 15000, price: 15000 },
            availableTickets: [
              { id: 6, code: 'BEL-BOC-001', locationId: 1, locationName: 'Popular Pirata', price: 15000, dateTime: '2025-02-15T21:00:00', eventTitle: 'Belgrano vs Boca Juniors', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 7, code: 'BEL-BOC-002', locationId: 1, locationName: 'Popular Pirata', price: 15000, dateTime: '2025-02-15T21:00:00', eventTitle: 'Belgrano vs Boca Juniors', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 200,
            soldCount: 300
          },
          {
            location: { id: 3, name: 'Platea Cuéllar', capacity: 5000, price: 18000 },
            availableTickets: [
              { id: 8, code: 'BEL-PLAT-001', locationId: 3, locationName: 'Platea Cuéllar', price: 18000, dateTime: '2025-02-15T21:00:00', eventTitle: 'Belgrano vs Boca Juniors', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 9, code: 'BEL-PLAT-002', locationId: 3, locationName: 'Platea Cuéllar', price: 18000, dateTime: '2025-02-15T21:00:00', eventTitle: 'Belgrano vs Boca Juniors', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 50,
            soldCount: 100
          }
        ]
      },
      {
        eventId: 3,
        eventTitle: 'Belgrano vs Talleres',
        eventDetail: 'Derby Cordobés - Clásico Provincial',
        eventDate: '2025-03-02T19:15:00',
        eventType: 'Partido',
        tickets: [
          {
            location: { id: 1, name: 'Popular Pirata', capacity: 15000, price: 12000 },
            availableTickets: [
              { id: 10, code: 'BEL-TAL-001', locationId: 1, locationName: 'Popular Pirata', price: 12000, dateTime: '2025-03-02T19:15:00', eventTitle: 'Belgrano vs Talleres', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 11, code: 'BEL-TAL-002', locationId: 1, locationName: 'Popular Pirata', price: 12000, dateTime: '2025-03-02T19:15:00', eventTitle: 'Belgrano vs Talleres', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 100,
            soldCount: 400
          },
          {
            location: { id: 2, name: 'Popular Preferencial', capacity: 8000, price: 18000 },
            availableTickets: [
              { id: 12, code: 'BEL-TAL-PPF-001', locationId: 2, locationName: 'Popular Preferencial', price: 18000, dateTime: '2025-03-02T19:15:00', eventTitle: 'Belgrano vs Talleres', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 75,
            soldCount: 125
          }
        ]
      },
      {
        eventId: 4,
        eventTitle: 'Belgrano vs Racing Club',
        eventDetail: 'Partido por la Liga Profesional - Fecha 25',
        eventDate: '2025-03-16T17:00:00',
        eventType: 'Partido',
        tickets: [
          {
            location: { id: 1, name: 'Popular Pirata', capacity: 15000, price: 10000 },
            availableTickets: [
              { id: 13, code: 'BEL-RAC-001', locationId: 1, locationName: 'Popular Pirata', price: 10000, dateTime: '2025-03-16T17:00:00', eventTitle: 'Belgrano vs Racing Club', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 14, code: 'BEL-RAC-002', locationId: 1, locationName: 'Popular Pirata', price: 10000, dateTime: '2025-03-16T17:00:00', eventTitle: 'Belgrano vs Racing Club', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 180,
            soldCount: 220
          }
        ]
      },
      {
        eventId: 5,
        eventTitle: 'Presentación del Plantel 2025',
        eventDetail: 'Presentación oficial del equipo para la nueva temporada',
        eventDate: '2025-01-20T19:00:00',
        eventType: 'Evento',
        tickets: [
          {
            location: { id: 1, name: 'Popular Pirata', capacity: 15000, price: 0 },
            availableTickets: [
              { id: 15, code: 'BEL-PRES-001', locationId: 1, locationName: 'Popular Pirata', price: 0, dateTime: '2025-01-20T19:00:00', eventTitle: 'Presentación del Plantel 2025', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 16, code: 'BEL-PRES-002', locationId: 1, locationName: 'Popular Pirata', price: 0, dateTime: '2025-01-20T19:00:00', eventTitle: 'Presentación del Plantel 2025', available: true, createdAt: '2025-01-01T00:00:00' },
              { id: 17, code: 'BEL-PRES-003', locationId: 1, locationName: 'Popular Pirata', price: 0, dateTime: '2025-01-20T19:00:00', eventTitle: 'Presentación del Plantel 2025', available: true, createdAt: '2025-01-01T00:00:00' }
            ],
            availableCount: 500,
            soldCount: 100
          }
        ]
      }
    ];
  }

  /**
   * Ver secciones del estadio para un evento
   */
  verSectores(event: EventWithTickets): void {
    this.selectedEvent = event;
    this.showStadiumSections = true;
  }

  /**
   * Volver a la lista de eventos
   */
  volverAEntradas(): void {
    this.selectedEvent = null;
    this.showStadiumSections = false;
  }

  /**
   * Agregar entrada al carrito
   */
  agregarAlCarrito(location: TicketsByLocation, quantity: number = 1): void {
    if (!location.availableTickets || location.availableTickets.length === 0) {
      this.notificationService.warning(
        'Sin entradas disponibles',
        `No hay entradas disponibles para ${location.location.name}.`
      );
      return;
    }

    if (quantity > location.availableCount) {
      this.notificationService.warning(
        'Cantidad no disponible',
        `Solo hay ${location.availableCount} entradas disponibles para ${location.location.name}.`
      );
      return;
    }

    // Tomar las primeras entradas disponibles
    const ticketsToAdd = location.availableTickets.slice(0, quantity);
    
    ticketsToAdd.forEach(ticket => {
      const existingItem = this.cart.find(item => item.ticket.id === ticket.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * ticket.price;
      } else {
        this.cart.push({
          ticket: ticket,
          quantity: 1,
          subtotal: ticket.price
        });
      }
    });

    this.notificationService.success(
      'Agregado al carrito',
      `${quantity} entrada(s) de ${location.location.name} agregada(s) al carrito.`
    );
  }

  /**
   * Comprar entrada directamente
   */
  comprarEntrada(location: TicketsByLocation): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning(
        'Inicia sesión',
        'Debes iniciar sesión para comprar entradas.'
      );
      return;
    }

    if (!location.availableTickets || location.availableTickets.length === 0) {
      this.notificationService.warning(
        'Sector agotado',
        `Lo sentimos, las entradas para ${location.location.name} están agotadas.`
      );
      return;
    }

    const ticket = location.availableTickets[0];
    const eventInfo = this.selectedEvent;
    
    const purchaseDetails = `
      <div class="purchase-details text-start">
        <h6 class="mb-3">Detalles de la compra:</h6>
        <p><strong>Evento:</strong> ${eventInfo?.eventTitle}</p>
        <p><strong>Fecha:</strong> ${this.ticketService.formatDate(ticket.dateTime)}</p>
        <p><strong>Sector:</strong> ${location.location.name}</p>
        <p><strong>Precio:</strong> ${this.ticketService.formatPrice(ticket.price)}</p>
        <p><strong>Código:</strong> ${ticket.code}</p>
        <hr>
        <p class="text-muted">Serás redirigido al sistema de pago para completar tu compra.</p>
      </div>
    `;

    this.notificationService.confirm(
      'Confirmar compra',
      purchaseDetails,
      'Proceder al pago',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.procesarCompra([ticket]);
      }
    });
  }

  /**
   * Procesar compra de entradas
   */
  private procesarCompra(tickets: Ticket[]): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning(
        'Inicia sesión',
        'Debes iniciar sesión para realizar la compra.'
      );
      return;
    }

    const user = this.authService.getCurrentUserValue();
    if (!user) {
      this.notificationService.error('Error', 'No se pudo obtener información del usuario.');
      return;
    }

    this.notificationService.showLoading('Procesando compra...');
    
    // Obtener IDs de tickets y email del usuario
    const ticketIds = tickets.map(ticket => ticket.id);
    const userEmail = user.email;

    // Llamar al servicio real de MercadoPago
    this.ticketService.createPaymentPreference(ticketIds, userEmail)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
      this.notificationService.hideLoading();
          
          if (response && response.checkoutUrl) {
            // Guardar información del pago pendiente
            if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
              const paymentInfo = {
                ticketIds: ticketIds,
                userEmail: userEmail,
                preferenceId: response.preferenceId,
                timestamp: new Date().toISOString(),
                processed: false
              };
              localStorage.setItem('mundoPirata_pendingPayment', JSON.stringify(paymentInfo));
            }
            
            // Redirigir a MercadoPago
            window.open(response.checkoutUrl, '_blank');
            
            // Mostrar mensaje de procesamiento
            this.showPaymentProcessingMessage(ticketIds, userEmail);
            
            // Limpiar carrito 
      this.cart = [];
          } else {
            this.notificationService.error(
              'Error en el pago',
              'No se pudo generar la preferencia de pago.'
            );
          }
        },
        error: (error) => {
          this.notificationService.hideLoading();
          console.error('Error creando preferencia de pago:', error);
          this.notificationService.error(
            'Error en el pago',
            'No se pudo procesar la compra. Por favor, intenta nuevamente.'
          );
        }
      });
  }

  /**
   * Ver carrito de compras
   */
  verCarrito(): void {
    if (this.cart.length === 0) {
      this.notificationService.info(
        'Carrito vacío',
        'No tienes entradas en tu carrito de compras.'
      );
      return;
    }
    this.showCart = true;
  }

  /**
   * Cerrar carrito
   */
  cerrarCarrito(): void {
    this.showCart = false;
  }

  /**
   * Eliminar item del carrito
   */
  eliminarDelCarrito(index: number): void {
    this.cart.splice(index, 1);
    this.notificationService.info('Entrada eliminada', 'La entrada ha sido eliminada del carrito.');
  }

  /**
   * Vaciar carrito
   */
  vaciarCarrito(silent: boolean = false): void {
    if (silent) {
      this.cart = [];
      return;
    }
    
    this.notificationService.confirm(
      'Vaciar carrito',
      '¿Estás seguro de que deseas vaciar el carrito?',
      'Sí, vaciar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.cart = [];
        this.notificationService.success('Carrito vaciado', 'Todas las entradas han sido eliminadas del carrito.');
      }
    });
  }

  /**
   * Finalizar compra del carrito
   */
  finalizarCompra(): void {
    if (this.cart.length === 0) return;

    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning(
        'Inicia sesión',
        'Debes iniciar sesión para finalizar la compra.'
      );
      return;
    }

    const total = this.getCartTotal();
    const cartDetails = this.cart.map(item => 
      `${item.quantity}x ${item.ticket.locationName} - ${this.ticketService.formatPrice(item.subtotal)}`
    ).join('<br>');

    const purchaseDetails = `
      <div class="purchase-details text-start">
        <h6 class="mb-3">Resumen de compra:</h6>
        ${cartDetails}
        <hr>
        <p><strong>Total: ${this.ticketService.formatPrice(total)}</strong></p>
        <p class="text-muted">Serás redirigido al sistema de pago para completar tu compra.</p>
      </div>
    `;

    this.notificationService.confirm(
      'Finalizar compra',
      purchaseDetails,
      'Proceder al pago',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        const tickets = this.cart.map(item => item.ticket);
        this.procesarCompra(tickets);
      }
    });
  }

  /**
   * Obtener total del carrito
   */
  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Obtener cantidad de items en el carrito
   */
  getCartItemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateTime: string): string {
    return this.ticketService.formatDate(dateTime);
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return this.ticketService.formatPrice(price);
  }

  /**
   * Obtener eventos filtrados de manera simple
   */
  getFilteredEvents(): EventWithTickets[] {
    let filtered = [...this.eventsWithTickets];

    // Filtrar por término de búsqueda
    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.eventTitle.toLowerCase().includes(term) ||
        event.eventDetail.toLowerCase().includes(term)
      );
    }

    // Filtrar por rango de precio
    if (this.selectedPriceRange) {
      filtered = filtered.filter(event => {
        if (!event.tickets || event.tickets.length === 0) return false;
        const minPrice = Math.min(...event.tickets.map(t => t.location.price));
        
          switch (this.selectedPriceRange) {
          case 'free': return minPrice === 0;
          case 'low': return minPrice > 0 && minPrice <= 10000;
          case 'medium': return minPrice > 10000 && minPrice <= 25000;
          case 'high': return minPrice > 25000;
            default: return true;
          }
      });
    }

    // Mostrar solo eventos con entradas disponibles
    if (this.showOnlyAvailable) {
      filtered = filtered.filter(event => {
        if (!event.tickets || event.tickets.length === 0) return false;
        return event.tickets.some(t => t.availableCount > 0);
      });
    }

    return filtered;
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPriceRange = '';
    this.showOnlyAvailable = true;
  }

  /**
   * Refrescar datos
   */
  refresh(): void {
    if (this.isLoading) return;
    this.loadEventsWithTickets();
  }

  /**
   * Obtener precio mínimo de un evento
   */
  getMinPrice(event: EventWithTickets): number {
    if (!event.tickets || event.tickets.length === 0) return 0;
    return Math.min(...event.tickets.map(t => t.location.price));
  }

  /**
   * Obtener precio máximo de un evento
   */
  getMaxPrice(event: EventWithTickets): number {
    if (!event.tickets || event.tickets.length === 0) return 0;
    return Math.max(...event.tickets.map(t => t.location.price));
  }

  /**
   * Obtener total de entradas disponibles de un evento
   */
  getTotalAvailableTickets(event: EventWithTickets): number {
    if (!event.tickets || event.tickets.length === 0) return 0;
    return event.tickets.reduce((total, t) => total + t.availableCount, 0);
  }

  /**
   * Verificar si todas las entradas están agotadas
   */
  areAllTicketsSoldOut(event: EventWithTickets): boolean {
    if (!event.tickets || event.tickets.length === 0) return true;
    return event.tickets.every(t => t.availableCount === 0);
  }

  /**
   * Obtener total de entradas disponibles del evento seleccionado
   */
  getSelectedEventTotalAvailable(): number {
    if (!this.selectedEvent) return 0;
    return this.getTotalAvailableTickets(this.selectedEvent);
  }

  /**
   * Verificar si el evento es un partido (vs otro equipo)
   */
  isMatchEvent(eventTitle: string): boolean {
    return eventTitle.toLowerCase().includes('vs') || eventTitle.toLowerCase().includes('belgrano');
  }

  /**
   * Obtener el nombre del equipo rival
   */
  getRivalTeamName(eventTitle: string): string {
    if (!eventTitle.includes('vs')) return 'Rival';
    const parts = eventTitle.split('vs');
    if (parts.length < 2) return 'Rival';
    const rivalPart = parts[1].trim();
    const words = rivalPart.split(' ');
    return words.length > 0 ? words[0] : 'Rival';
  }

  /**
   * Obtener el logo del equipo rival basado en el título del evento
   */
  getRivalTeamLogo(eventTitle: string): string {
    const title = eventTitle.toLowerCase();
    
    // Mapeo de equipos a sus logos
    const teamLogos: { [key: string]: string } = {
      'boca': 'boca.png',
      'river': 'river.png',
      'racing': 'racing.png',
      'independiente': 'independiente.png',
      'san lorenzo': 'sanlorenzo.png',
      'estudiantes': 'estudiantes.png',
      'gimnasia': 'gimnasia.png',
      'talleres': 'talleres.png',
      'vélez': 'velez.png',
      'velez': 'velez.png',
      'huracán': 'huracan.png',
      'huracan': 'huracan.png',
      'newells': 'newells.png',
      'newell': 'newells.png',
      'lanús': 'lanus.png',
      'lanus': 'lanus.png',
      'banfield': 'banfield.png',
      'platense': 'platense.png',
      'tigre': 'tigre.png',
      'aldosivi': 'aldosivi.png',
      'argentinos': 'argentinos.png',
      'atlético tucumán': 'atleticotucuman.png',
      'atletico tucuman': 'atleticotucuman.png',
      'barracas': 'barracas.png',
      'central córdoba': 'centralcordoba.png',
      'central cordoba': 'centralcordoba.png',
      'defensa': 'defensa.png',
      'godoy cruz': 'godoycruz.png',
      'independiente rivadavia': 'independienteriv.png',
      'instituto': 'instituto.png',
      'riestra': 'riestra.png',
      'rosario central': 'rosariocentral.png',
      'san martín': 'sanmartinsj.png',
      'san martin': 'sanmartinsj.png',
      'sarmiento': 'sarmiento.png',
      'unión': 'union.png',
      'union': 'union.png'
    };

    // Buscar el equipo rival en el título
    for (const [team, logo] of Object.entries(teamLogos)) {
      if (title.includes(team)) {
        return `assets/${logo}`;
      }
    }

    // Logo por defecto si no encuentra el equipo
    return 'assets/logo.png';
  }
}
 