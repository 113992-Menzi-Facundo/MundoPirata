import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventApi, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarService, CalendarEvent } from '../../services/calendar.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterLink, FullCalendarModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
  host: {
    class: 'app-calendario'
  }
})
export class CalendarioComponent implements OnInit {
  @ViewChild('calendar') calendarComponent: any;
  isBrowser: boolean;
  isLoading = true;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    initialView: 'dayGridMonth',
    locale: esLocale,
    height: 'auto',
    selectable: false,
    dayMaxEvents: 3,
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventColor: '#0066cc',
    eventTextColor: '#ffffff',
    eventBorderColor: '#004499',
    eventDisplay: 'block',
    displayEventTime: true,
    displayEventEnd: false,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  };

  currentEvents: EventApi[] = [];
  showEventModal = false;
  selectedEvent: any = null;
  selectedEventData: CalendarEvent | null = null;
  calendarEvents: CalendarEvent[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private calendarService: CalendarService,
    private notificationService: NotificationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.calendarService.getAllActiveEvents().subscribe({
      next: (events) => {
        this.calendarEvents = events;
        this.calendarOptions.events = this.convertToFullCalendarEvents(events);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando eventos:', error);
        this.isLoading = false;
        this.notificationService.error(
          'Error al cargar eventos',
          'No se pudieron cargar los eventos del calendario. Se mostrarán eventos de ejemplo.'
        );
        // Fallback a eventos de ejemplo
        this.loadFallbackEvents();
      }
    });
  }

  convertToFullCalendarEvents(events: CalendarEvent[]): EventInput[] {
    return events.map(event => ({
      id: event.id.toString(),
      title: event.title,
      start: event.date,
      color: this.getEventColor(event.eventTypeDescription),
      textColor: '#ffffff',
      borderColor: this.getEventBorderColor(event.eventTypeDescription),
      extendedProps: {
        detail: event.detail,
        authorName: event.authorName,
        eventType: event.eventTypeDescription,
        originalEvent: event
      }
    }));
  }

  getEventColor(eventType: string): string {
    const colorMap: {[key: string]: string} = {
      'Partido de Fútbol': '#dc3545',
      'Entrenamiento Abierto': '#28a745',
      'Evento Social': '#17a2b8',
      'Conferencia de Prensa': '#ffc107',
      'Actividad Institucional': '#6f42c1'
    };
    return colorMap[eventType] || '#0066cc';
  }

  getEventBorderColor(eventType: string): string {
    const color = this.getEventColor(eventType);
    // Hacer el borde más oscuro
    const colorMap: {[key: string]: string} = {
      '#dc3545': '#b21e2e',
      '#28a745': '#1e7e34',
      '#17a2b8': '#117a8b',
      '#ffc107': '#e0a800',
      '#6f42c1': '#59359a'
    };
    return colorMap[color] || '#004499';
  }

  getEventIcon(eventType: string): string {
    const iconMap: {[key: string]: string} = {
      'Partido de Fútbol': 'fas fa-futbol',
      'Entrenamiento Abierto': 'fas fa-running',
      'Evento Social': 'fas fa-users',
      'Conferencia de Prensa': 'fas fa-microphone',
      'Actividad Institucional': 'fas fa-calendar-alt'
    };
    return iconMap[eventType] || 'fas fa-calendar';
  }

  loadFallbackEvents() {
    // Eventos de ejemplo para cuando no se puede conectar al backend
    const fallbackEvents = [
      {
        id: '1',
        title: 'Belgrano vs River',
        start: this.getNextDateWithTime(7, '21:00'),
        color: '#dc3545',
        extendedProps: {
          eventType: 'Partido de Fútbol',
          detail: 'Partido por la Liga Profesional',
          authorName: 'Administrador',
          lugar: 'Estadio Julio César Villagra'
        }
      },
      {
        id: '2',
        title: 'Entrenamiento Abierto',
        start: this.getNextDateWithTime(3, '10:00'),
        color: '#28a745',
        extendedProps: {
          eventType: 'Entrenamiento Abierto',
          detail: 'Práctica abierta al público',
          authorName: 'Cuerpo Técnico',
          lugar: 'Predio de Entrenamiento'
        }
      },
      {
        id: '3',
        title: 'Conferencia de Prensa',
        start: this.getNextDateWithTime(5, '15:00'),
        color: '#ffc107',
        extendedProps: {
          eventType: 'Conferencia de Prensa',
          detail: 'Rueda de prensa previa al partido',
          authorName: 'Prensa',
          lugar: 'Sala de Prensa'
        }
      }
    ];
    
    this.calendarOptions.events = fallbackEvents;
  }

  getNextDateWithTime(daysFromNow: number, time: string): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return `${date.toISOString().split('T')[0]}T${time}:00`;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.selectedEvent = clickInfo.event;
    
    // Buscar el evento original en los datos del backend
    if (this.selectedEvent.extendedProps?.originalEvent) {
      this.selectedEventData = this.selectedEvent.extendedProps.originalEvent;
    } else {
      this.selectedEventData = null;
    }
    
    this.showEventModal = true;
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  cerrarModal() {
    this.showEventModal = false;
    this.selectedEvent = null;
    this.selectedEventData = null;
  }

  obtenerIconoEvento(eventType: string): string {
    return this.getEventIcon(eventType);
  }

  obtenerColorEvento(eventType: string): string {
    return this.getEventColor(eventType);
  }

  formatearFecha(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isPartido(eventType: string): boolean {
    return eventType === 'Partido de Fútbol';
  }

  refreshCalendar() {
    this.loadEvents();
  }

  // Método para navegación por teclado (accesibilidad)
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showEventModal) {
      this.cerrarModal();
    }
  }
} 