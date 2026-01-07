import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TicketService, EventWithTickets } from '../../../services/ticket.service';
import { CalendarService } from '../../../services/calendar.service';
import { NotificationService } from '../../../services/notification.service';
import Swal from 'sweetalert2';

interface MatchStats {
  totalMatches: number;
  totalTicketsSold: number;
  totalRevenue: number;
  avgAttendance: number;
  topMatches: { id?: number; title: string; sold: number; revenue: number; attendance: number }[];
}

interface Rival {
  id: string;
  name: string;
  logo: string;
}

@Component({
  selector: 'app-ticket-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ticket-management.component.html',
  styleUrls: ['./ticket-management.component.css']
})
export class TicketManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estados
  isLoading = false;
  activeView: 'stats' | 'create' = 'stats';

  // Datos
  events: EventWithTickets[] = [];
  stats: MatchStats = {
    totalMatches: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    avgAttendance: 0,
    topMatches: []
  };

  // Formulario para crear partido
  createMatchForm: FormGroup;

  // Lista de rivales de la Liga Profesional
  rivals: Rival[] = [
    { id: 'aldosivi', name: 'Aldosivi', logo: 'aldosivi.png' },
    { id: 'argentinos', name: 'Argentinos Juniors', logo: 'argentinos.png' },
    { id: 'atleticotucuman', name: 'Atlético Tucumán', logo: 'atleticotucuman.png' },
    { id: 'banfield', name: 'Banfield', logo: 'banfield.png' },
    { id: 'barracas', name: 'Barracas Central', logo: 'barracas.png' },
    { id: 'boca', name: 'Boca Juniors', logo: 'boca.png' },
    { id: 'centralcordoba', name: 'Central Córdoba', logo: 'centralcordoba.png' },
    { id: 'defensa', name: 'Defensa y Justicia', logo: 'defensa.png' },
    { id: 'estudiantes', name: 'Estudiantes', logo: 'estudiantes.png' },
    { id: 'gimnasia', name: 'Gimnasia La Plata', logo: 'gimnasia.png' },
    { id: 'godoycruz', name: 'Godoy Cruz', logo: 'godoycruz.png' },
    { id: 'huracan', name: 'Huracán', logo: 'huracan.png' },
    { id: 'independiente', name: 'Independiente', logo: 'independiente.png' },
    { id: 'independienteriv', name: 'Independiente Rivadavia', logo: 'independienteriv.png' },
    { id: 'instituto', name: 'Instituto', logo: 'instituto.png' },
    { id: 'lanus', name: 'Lanús', logo: 'lanus.png' },
    { id: 'newells', name: 'Newell\'s Old Boys', logo: 'newells.png' },
    { id: 'platense', name: 'Platense', logo: 'platense.png' },
    { id: 'racing', name: 'Racing Club', logo: 'racing.png' },
    { id: 'riestra', name: 'Deportivo Riestra', logo: 'riestra.png' },
    { id: 'river', name: 'River Plate', logo: 'river.png' },
    { id: 'rosariocentral', name: 'Rosario Central', logo: 'rosariocentral.png' },
    { id: 'sanlorenzo', name: 'San Lorenzo', logo: 'sanlorenzo.png' },
    { id: 'sanmartinsj', name: 'San Martín de San Juan', logo: 'sanmartinsj.png' },
    { id: 'sarmiento', name: 'Sarmiento', logo: 'sarmiento.png' },
    { id: 'talleres', name: 'Talleres', logo: 'talleres.png' },
    { id: 'tigre', name: 'Tigre', logo: 'tigre.png' },
    { id: 'union', name: 'Unión', logo: 'union.png' },
    { id: 'velez', name: 'Vélez Sarsfield', logo: 'velez.png' }
  ];

  // Sectores del estadio (SIN Palcos VIP)
  stadiumSectors = [
    { id: 1, name: 'Popular Pirata', capacity: 15000, price: 8000 },
    { id: 2, name: 'Popular Preferencial', capacity: 8000, price: 12000 },
    { id: 3, name: 'Platea Cuéllar', capacity: 5000, price: 18000 },
    { id: 4, name: 'Platea Heredia', capacity: 5000, price: 18000 }
  ];

  constructor(
    private ticketService: TicketService,
    private calendarService: CalendarService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.createMatchForm = this.fb.group({
      rivalId: ['', Validators.required],
      matchDate: ['', Validators.required],
      matchTime: ['21:00', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CARGA DE ESTADÍSTICAS
  // =====================================================

  loadStats(): void {
    this.isLoading = true;
    this.ticketService.getEventsWithTickets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.calculateStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando estadísticas:', error);
          Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudieron cargar las estadísticas',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
          this.isLoading = false;
        }
      });
  }

  calculateStats(): void {
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let totalCapacity = 0;
    
    // Usar un array en lugar de un objeto para evitar sobrescribir eventos con el mismo título
    const matchStatsArray: Array<{
      id: number;
      title: string;
      sold: number;
      revenue: number;
      capacity: number;
      eventDate: string;
    }> = [];

    console.log('📊 Calculando estadísticas REALES con eventos:', this.events);

    this.events.forEach((event, index) => {
      let eventSold = 0;
      let eventRevenue = 0;
      let eventCapacity = 0;

      event.tickets.forEach(ticketGroup => {
        // Usar datos REALES de la base de datos
        const realSold = ticketGroup.soldCount || 0; // Entradas realmente vendidas
        const realAvailable = ticketGroup.availableCount || 0; // Entradas disponibles
        const totalTicketsInGroup = realSold + realAvailable;
        
        eventSold += realSold;
        eventRevenue += realSold * ticketGroup.location.price;
        eventCapacity += totalTicketsInGroup;
        
        console.log(`📍 ${ticketGroup.location.name}: ${realSold}/${totalTicketsInGroup} vendidas REALES (${realSold > 0 ? (realSold/totalTicketsInGroup*100).toFixed(1) : 0}%)`);
      });

      totalTicketsSold += eventSold;
      totalRevenue += eventRevenue;
      totalCapacity += eventCapacity;

      // Usar ID del evento o índice como clave única para evitar duplicados por título
      const eventId = event.eventId || (index + 1);
      const eventDate = event.eventDate ? new Date(event.eventDate).toISOString() : '';
      
      // Crear una clave única combinando título y fecha para distinguir eventos duplicados
      const uniqueKey = `${event.eventTitle}_${eventDate}_${eventId}`;
      
      matchStatsArray.push({
        id: eventId,
        title: event.eventTitle,
        sold: eventSold,
        revenue: eventRevenue,
        capacity: eventCapacity,
        eventDate: eventDate
      });
      
      console.log(`🏟️ ${event.eventTitle} (ID: ${eventId}): ${eventSold}/${eventCapacity} entradas vendidas REALES ($${eventRevenue} ARS)`);
    });

    // Mostrar TODOS los partidos, ordenados por ingresos
    const topMatches = matchStatsArray
      .map(match => ({
        id: match.id,
        title: match.title,
        sold: match.sold,
        revenue: match.revenue,
        attendance: match.capacity > 0 ? (match.sold / match.capacity) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    this.stats = {
      totalMatches: this.events.length,
      totalTicketsSold,
      totalRevenue,
      avgAttendance: totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0,
      topMatches
    };
    
    console.log('📈 Estadísticas REALES finales:', this.stats);
    console.log('💰 Ingresos totales REALES: $' + totalRevenue + ' ARS');
    console.log('🎫 Entradas vendidas REALES: ' + totalTicketsSold);
    console.log('📋 Total de partidos en stats.topMatches:', this.stats.topMatches.length);
  }

  // =====================================================
  // CREAR NUEVO PARTIDO
  // =====================================================

  createMatch(): void {
    if (this.createMatchForm.invalid) {
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos',
        icon: 'warning',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    const formData = this.createMatchForm.value;
    const selectedRival = this.rivals.find(r => r.id === formData.rivalId);

    if (!selectedRival) {
      Swal.fire({
        title: 'Error',
        text: 'Rival no válido',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    this.isLoading = true;

    // Crear fecha y hora del partido
    const matchDateTime = `${formData.matchDate}T${formData.matchTime}:00`;
    const matchTitle = `Belgrano vs ${selectedRival.name}`;

    // Crear evento en el calendario
    const calendarEvent = {
      title: matchTitle,
      detail: `Partido de Liga Profesional en el Gigante de Alberdi. Belgrano recibe a ${selectedRival.name}.`,
      date: formData.matchDate, // Solo la fecha, sin hora
      eventTypeId: 1, // Tipo "Partido"
      authorId: 1 // ID del usuario administrador (deberías obtener esto del servicio de auth)
    };

    console.log('🏟️ Creando evento en calendario:', calendarEvent);

    // Paso 1: Crear evento en calendario
    this.calendarService.createEvent(calendarEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdEvent) => {
          console.log('✅ Evento creado exitosamente:', createdEvent);
          
          // Paso 2: Crear entradas para todos los sectores
          this.createTicketsForAllSectors(matchDateTime, createdEvent.id);
        },
        error: (error) => {
          console.error('❌ Error creando evento:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el evento en el calendario',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
          this.isLoading = false;
        }
      });
  }

  private createTicketsForAllSectors(matchDateTime: string, eventId: number): void {
    const ticketPromises: any[] = [];
    let totalTicketsCreated = 0;

    console.log('🎫 Iniciando creación de entradas para todos los sectores...');

    // Crear entradas para cada sector
    this.stadiumSectors.forEach(sector => {
      console.log(`📍 Creando entradas para ${sector.name}...`);
      
      // Crear múltiples entradas para el sector según su capacidad
      // Por ahora crearemos una cantidad representativa (ej: 100 entradas por sector)
      const ticketsToCreate = Math.min(sector.capacity, 100); // Limitamos a 100 por sector para no saturar
      
      for (let i = 0; i < ticketsToCreate; i++) {
        const ticketData = {
          locationId: sector.id,
          price: sector.price,
          dateTime: matchDateTime
          // El código se genera automáticamente en el backend
        };

        const ticketPromise = this.ticketService.createTicket(ticketData).toPromise();
        ticketPromises.push(ticketPromise);
      }

      console.log(`✅ Programadas ${ticketsToCreate} entradas para ${sector.name} (Capacidad: ${sector.capacity})`);
      totalTicketsCreated += ticketsToCreate;
    });

    console.log(`🎯 Total de entradas a crear: ${totalTicketsCreated}`);

    // Ejecutar todas las promesas de creación de tickets
    Promise.allSettled(ticketPromises)
      .then(results => {
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;

        console.log(`📊 Resultado: ${successful} entradas creadas exitosamente, ${failed} fallos`);

        if (successful > 0) {
          const rivalName = this.createMatchForm.get('rivalId')?.value ? this.getRivalName(this.createMatchForm.get('rivalId')?.value) : 'Rival';
          
          Swal.fire({
            title: '¡Partido creado exitosamente!',
            html: `
              <div class="text-center">
                <div class="mb-3">
                  <img src="assets/logo.png" width="40" class="me-2">
                  <span class="fw-bold">VS</span>
                  <img src="${this.getRivalLogo(this.createMatchForm.get('rivalId')?.value)}" width="40" class="ms-2">
                </div>
                <p class="mb-2"><strong>Belgrano vs ${rivalName}</strong></p>
                <p class="text-muted mb-0">Se crearon ${successful} entradas disponibles para la venta.</p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#2E86AB',
            confirmButtonText: 'Perfecto'
          });

          // Limpiar formulario y volver a estadísticas
          this.createMatchForm.reset();
          this.createMatchForm.patchValue({ matchTime: '21:00' });
          this.activeView = 'stats';
          
          // Recargar estadísticas
          this.loadStats();
        } else {
          Swal.fire({
            title: 'Evento creado parcialmente',
            text: 'El evento se creó en el calendario pero hubo problemas creando las entradas. Contacta al administrador del sistema.',
            icon: 'warning',
            confirmButtonColor: '#f39c12'
          });
        }

        this.isLoading = false;
      })
      .catch(error => {
        console.error('❌ Error crítico en creación masiva de entradas:', error);
        Swal.fire({
          title: 'Error creando entradas',
          text: 'El evento se creó en el calendario pero no se pudieron crear las entradas automáticamente.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
        this.isLoading = false;
      });
  }

  // =====================================================
  // ELIMINAR PARTIDO
  // =====================================================

  deleteMatch(eventId: number): void {
    // Buscar el evento en la lista local primero para obtener el título
    const localEvent = this.events.find(e => e.eventId === eventId);
    if (!localEvent) {
      Swal.fire({
        title: 'Error',
        text: 'No se encontró información del partido',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    // Usar SweetAlert para confirmación
    Swal.fire({
      title: '¿Eliminar partido?',
      html: `
        <div class="text-center">
          <div class="mb-3">
            <img src="assets/logo.png" width="30" class="me-2">
            <span class="fw-bold">VS</span>
            <img src="${this.getRivalLogoFromTitle(localEvent.eventTitle)}" width="30" class="ms-2">
          </div>
          <p class="mb-2"><strong>${localEvent.eventTitle}</strong></p>
          <p class="text-muted mb-0">Esta acción eliminará todas las entradas asociadas y no se puede deshacer.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteMatch(localEvent);
      }
    });
  }

  private performDeleteMatch(localEvent: any): void {
    this.isLoading = true;
    
    // Usar el ID real del evento del calendario si está disponible
    if (localEvent.eventId && localEvent.eventId > 0) {
      console.log('✅ Eliminando evento con ID:', localEvent.eventId);
      
      // Eliminar evento del calendario directamente usando el ID
      this.calendarService.deleteEvent(localEvent.eventId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Partido eliminado!',
            text: 'El partido y todas sus entradas han sido eliminados correctamente',
            icon: 'success',
            confirmButtonColor: '#2E86AB'
          });
          this.loadStats(); // Recargar estadísticas
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error eliminando partido del calendario:', error);
          
          // Verificar si el error es por entradas vendidas
          const errorMessage = error.error?.message || error.message || '';
          if (errorMessage.includes('ya se vendieron') || errorMessage.includes('Solo se pueden eliminar eventos sin ventas')) {
            Swal.fire({
              title: '❌ No se puede eliminar',
              html: `
                <div class="text-center">
                  <div class="mb-3">
                    <i class="fas fa-ticket-alt text-warning" style="font-size: 48px;"></i>
                  </div>
                  <p class="mb-2"><strong>${localEvent.eventTitle}</strong></p>
                  <p class="text-muted">Este partido ya tiene entradas vendidas y no puede ser eliminado.</p>
                  <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle me-2"></i>
                    Solo se pueden eliminar partidos que no tengan ventas realizadas.
                  </div>
                </div>
              `,
              icon: 'warning',
              confirmButtonColor: '#f39c12',
              confirmButtonText: 'Entendido'
            });
          } else {
            Swal.fire({
              title: 'Error eliminando partido',
              text: 'Ocurrió un error inesperado al eliminar el partido',
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
          
          this.isLoading = false;
        }
      });
    } else {
      // Fallback: buscar por título si no hay ID válido
      console.log('⚠️ No hay ID válido, buscando por título:', localEvent.eventTitle);
      
      this.calendarService.getAllEvents().pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (calendarEvents) => {
          // Buscar evento por título exacto
          const targetEvent = calendarEvents.find(event => 
            event.title.trim().toLowerCase() === localEvent.eventTitle.trim().toLowerCase()
          );
          
          if (targetEvent) {
            console.log('✅ Evento encontrado para eliminar:', targetEvent);
            
            // Eliminar evento del calendario
            this.calendarService.deleteEvent(targetEvent.id).pipe(
              takeUntil(this.destroy$)
            ).subscribe({
              next: () => {
                Swal.fire({
                  title: '¡Partido eliminado!',
                  text: 'El partido y todas sus entradas han sido eliminados correctamente',
                  icon: 'success',
                  confirmButtonColor: '#2E86AB'
                });
                this.loadStats();
                this.isLoading = false;
              },
              error: (error) => {
                console.error('❌ Error eliminando partido:', error);
                Swal.fire({
                  title: 'Error eliminando partido',
                  text: 'Ocurrió un error inesperado al eliminar el partido',
                  icon: 'error',
                  confirmButtonColor: '#dc3545'
                });
                this.isLoading = false;
              }
            });
          } else {
            Swal.fire({
              title: 'Partido no encontrado',
              text: 'No se encontró el partido en el calendario. Puede que ya haya sido eliminado.',
              icon: 'warning',
              confirmButtonColor: '#f39c12'
            });
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('❌ Error cargando eventos del calendario:', error);
          Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudieron cargar los eventos del calendario',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
          this.isLoading = false;
        }
      });
    }
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getRivalLogo(rivalId: string): string {
    return `assets/${this.rivals.find(r => r.id === rivalId)?.logo || 'logo.png'}`;
  }

  getRivalName(rivalId: string): string {
    return this.rivals.find(r => r.id === rivalId)?.name || 'Rival no encontrado';
  }

  getTotalStadiumCapacity(): number {
    return this.stadiumSectors.reduce((sum, sector) => sum + sector.capacity, 0);
  }

  refresh(): void {
    this.loadStats();
  }

  // =====================================================
  // UTILIDADES PARA MOSTRAR INFORMACIÓN DE RIVALES
  // =====================================================

  extractRivalFromTitle(title: string): string {
    // Extraer nombre del rival del título "Belgrano vs [Rival]"
    if (title && title.includes(' vs ')) {
      const parts = title.split(' vs ');
      if (parts.length > 1) {
        return parts[1].trim();
      }
    }
    return '';
  }

  getRivalLogoFromTitle(title: string): string {
    const rival = this.extractRivalFromTitle(title);
    if (!rival) return 'assets/logo.png';
    
    // Mapear nombres de rivales a archivos de logo
    const logoMap: { [key: string]: string } = {
      'Boca Juniors': 'boca.png',
      'River Plate': 'river.png',
      'Talleres': 'talleres.png',
      'Racing Club': 'racing.png',
      'Independiente': 'independiente.png',
      'San Lorenzo': 'sanlorenzo.png',
      'Estudiantes': 'estudiantes.png',
      'Gimnasia': 'gimnasia.png',
      'Lanús': 'lanus.png',
      'Vélez': 'velez.png',
      'Huracán': 'huracan.png',
      'Platense': 'platense.png',
      'Tigre': 'tigre.png',
      'Argentinos Juniors': 'argentinos.png',
      'Colón': 'colon.png',
      'Unión': 'union.png',
      'Arsenal': 'arsenal.png',
      'Godoy Cruz': 'godoycruz.png',
      'Banfield': 'banfield.png',
      'Defensa y Justicia': 'defensa.png',
      'Atlético Tucumán': 'atleticotucuman.png',
      'Central Córdoba': 'centralcordoba.png',
      'Rosario Central': 'rosariocentral.png',
      'Newells': 'newells.png',
      'Barracas Central': 'barracas.png',
      'Riestra': 'riestra.png',
      'Sarmiento': 'sarmiento.png',
      'San Martín de San Juan': 'sanmartinsj.png',
      'Instituto': 'instituto.png'
    };
    
    return `assets/${logoMap[rival] || 'logo.png'}`;
  }
} 