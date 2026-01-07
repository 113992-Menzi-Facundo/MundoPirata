import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarService, CalendarEvent, EventType, CalendarEventCreate, CalendarEventUpdate } from '../../../services/calendar.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-calendar-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar-management.component.html',
  styleUrls: ['./calendar-management.component.css']
})
export class CalendarManagementComponent implements OnInit {
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  eventTypes: EventType[] = [];
  searchTerm: string = '';
  selectedEventType: string = 'all';
  selectedState: string = 'all';
  isLoading = false;
  
  // Formularios
  eventForm!: FormGroup;
  isEditMode = false;
  editingEventId: number | null = null;
  showEventModal = false;
  
  // Usuario actual
  currentUserId: number | null = null;

  constructor(
    private calendarService: CalendarService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUserValue();
    this.currentUserId = currentUser?.id || null;
    this.loadEventTypes();
    this.loadEvents();
  }

  initializeForm() {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      detail: [''],
      date: ['', Validators.required],
      eventTypeId: ['', Validators.required]
    });
  }

  loadEventTypes() {
    this.calendarService.getAllEventTypes().subscribe({
      next: (types) => {
        this.eventTypes = types;
      },
      error: (error) => {
        console.error('Error cargando tipos de eventos:', error);
        this.notificationService.error(
          'Error',
          'No se pudieron cargar los tipos de eventos.'
        );
      }
    });
  }

  loadEvents() {
    this.isLoading = true;
    this.calendarService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando eventos:', error);
        this.notificationService.error(
          'Error al cargar eventos',
          'No se pudieron cargar los eventos. Intenta nuevamente.'
        );
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.events];

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.detail?.toLowerCase().includes(term) ||
        event.authorName.toLowerCase().includes(term) ||
        event.eventTypeDescription.toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo de evento
    if (this.selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.eventTypeId.toString() === this.selectedEventType);
    }

    // Filtrar por estado
    if (this.selectedState !== 'all') {
      const isActive = this.selectedState === 'active';
      filtered = filtered.filter(event => event.state === isActive);
    }

    this.filteredEvents = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onEventTypeFilterChange() {
    this.applyFilters();
  }

  onStateFilterChange() {
    this.applyFilters();
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingEventId = null;
    this.eventForm.reset();
    this.showEventModal = true;
  }

  openEditModal(event: CalendarEvent) {
    this.isEditMode = true;
    this.editingEventId = event.id;
    
    this.eventForm.patchValue({
      title: event.title,
      detail: event.detail || '',
      date: event.date,
      eventTypeId: event.eventTypeId
    });
    
    this.showEventModal = true;
  }

  closeModal() {
    this.showEventModal = false;
    this.eventForm.reset();
    this.isEditMode = false;
    this.editingEventId = null;
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.notificationService.formError(['Por favor, completa todos los campos requeridos correctamente.']);
      return;
    }

    if (this.isEditMode) {
      this.updateEvent();
    } else {
      this.createEvent();
    }
  }

  createEvent() {
    if (!this.currentUserId) {
      this.notificationService.error('Error', 'No se pudo identificar el usuario actual.');
      return;
    }

    const eventData: CalendarEventCreate = {
      ...this.eventForm.value,
      authorId: this.currentUserId
    };
    
    this.notificationService.showLoading();
    this.calendarService.createEvent(eventData).subscribe({
      next: (newEvent) => {
        this.notificationService.hideLoading();
        this.notificationService.actionSuccess(
          'Evento creado',
          `El evento "${newEvent.title}" ha sido creado exitosamente.`
        );
        this.loadEvents();
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.hideLoading();
        console.error('Error creando evento:', error);
        this.notificationService.error(
          'Error al crear evento',
          'No se pudo crear el evento. Intenta nuevamente.'
        );
      }
    });
  }

  updateEvent() {
    if (!this.editingEventId) return;

    const eventData: CalendarEventUpdate = this.eventForm.value;

    this.notificationService.showLoading();
    this.calendarService.updateEvent(this.editingEventId, eventData).subscribe({
      next: (updatedEvent) => {
        this.notificationService.hideLoading();
        this.notificationService.actionSuccess(
          'Evento actualizado',
          `El evento "${updatedEvent.title}" ha sido actualizado.`
        );
        this.loadEvents();
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.hideLoading();
        console.error('Error actualizando evento:', error);
        this.notificationService.error(
          'Error al actualizar evento',
          'No se pudieron actualizar los datos del evento.'
        );
      }
    });
  }

  toggleEventState(event: CalendarEvent) {
    const action = event.state ? 'desactivar' : 'activar';
    
    this.notificationService.confirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} evento?`,
      `¿Estás seguro de que quieres ${action} el evento "<strong>${event.title}</strong>"?`,
      `Sí, ${action}`,
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading();
        this.calendarService.toggleEventState(event.id).subscribe({
          next: () => {
            this.notificationService.hideLoading();
            this.notificationService.actionSuccess(
              'Estado cambiado',
              `El evento ha sido ${action}do correctamente.`
            );
            this.loadEvents();
          },
          error: (error) => {
            this.notificationService.hideLoading();
            console.error('Error cambiando estado:', error);
            this.notificationService.error(
              'Error',
              `No se pudo ${action} el evento.`
            );
          }
        });
      }
    });
  }

  deleteEvent(event: CalendarEvent) {
    this.notificationService.confirmDelete(
      `¿Eliminar evento?`,
      `¿Estás seguro de que quieres eliminar el evento "<strong>${event.title}</strong>"?<br>
       <small class="text-muted">Fecha: ${this.formatDate(event.date)}</small><br>
       <small class="text-danger">Esta acción marcará el evento como inactivo.</small>`
    ).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading();
        this.calendarService.deleteEvent(event.id).subscribe({
          next: () => {
            this.notificationService.hideLoading();
            this.notificationService.actionSuccess(
              'Evento eliminado',
              `El evento "${event.title}" ha sido eliminado.`
            );
            this.loadEvents();
          },
          error: (error) => {
            this.notificationService.hideLoading();
            console.error('Error eliminando evento:', error);
            this.notificationService.error(
              'Error al eliminar evento',
              'No se pudo eliminar el evento. Intenta nuevamente.'
            );
          }
        });
      }
    });
  }

  getEventTypeBadgeClass(eventType: string): string {
    const typeMap: {[key: string]: string} = {
      'Partido': 'bg-success',
      'Entrenamiento': 'bg-primary',
      'Evento': 'bg-info',
      'Reunión': 'bg-warning text-dark',
      'Conferencia': 'bg-secondary'
    };
    return typeMap[eventType] || 'bg-primary';
  }

  getStateBadgeClass(state: boolean): string {
    return state ? 'bg-success' : 'bg-danger';
  }

  getStateText(state: boolean): string {
    return state ? 'Activo' : 'Inactivo';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isEventUpcoming(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  isEventToday(dateString: string): boolean {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  }
} 