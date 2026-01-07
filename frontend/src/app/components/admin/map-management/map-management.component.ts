import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapLocationService, MapLocation, MapLocationCreate, MapLocationUpdate } from '../../../services/map-location.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/auth.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-map-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-management.component.html',
  styleUrls: ['./map-management.component.css']
})
export class MapManagementComponent implements OnInit {
  locations: MapLocation[] = [];
  filteredLocations: MapLocation[] = [];
  currentUser: User | null = null;
  isLoading = false;
  
  // Modal y formulario
  showModal = false;
  isEditMode = false;
  selectedLocation: MapLocation | null = null;
  
  // Filtros y búsqueda
  searchTerm = '';
  stateFilter = 'all'; // all, active, inactive
  
  // Formulario
  locationForm: MapLocationCreate | MapLocationUpdate = {
    name: '',
    address: '',
    description: '',
    googleMapsUrl: '',
    authorId: 0
  };

  constructor(
    public mapLocationService: MapLocationService,
    private authService: AuthService
  ) {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  /**
   * Obtener cantidad de ubicaciones activas
   */
  getActiveLocationsCount(): number {
    return this.locations.filter(l => l.state).length;
  }

  /**
   * Obtener cantidad de ubicaciones inactivas
   */
  getInactiveLocationsCount(): number {
    return this.locations.filter(l => !l.state).length;
  }

  /**
   * Cargar todas las ubicaciones
   */
  loadLocations(): void {
    this.isLoading = true;
    this.mapLocationService.getAllLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar ubicaciones:', error);
        this.showErrorAlert('Error al cargar las ubicaciones');
        this.isLoading = false;
      }
    });
  }

  /**
   * Aplicar filtros de búsqueda y estado
   */
  applyFilters(): void {
    this.filteredLocations = this.locations.filter(location => {
      const matchesSearch = !this.searchTerm || 
        location.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        location.authorName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesState = this.stateFilter === 'all' || 
        (this.stateFilter === 'active' && location.state) ||
        (this.stateFilter === 'inactive' && !location.state);
      
      return matchesSearch && matchesState;
    });
  }

  /**
   * Manejar cambio en la búsqueda
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Manejar cambio en el filtro de estado
   */
  onStateFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.stateFilter = 'all';
    this.applyFilters();
  }

  /**
   * Abrir modal para crear nueva ubicación
   */
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedLocation = null;
    this.locationForm = {
      name: '',
      address: '',
      description: '',
      googleMapsUrl: '',
      authorId: this.currentUser?.id || 0
    };
    this.showModal = true;
  }

  /**
   * Abrir modal para editar ubicación
   */
  openEditModal(location: MapLocation): void {
    this.isEditMode = true;
    this.selectedLocation = location;
    this.locationForm = {
      name: location.name,
      address: location.address,
      description: location.description,
      googleMapsUrl: location.googleMapsUrl
    };
    this.showModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.showModal = false;
    this.selectedLocation = null;
    this.resetForm();
  }

  /**
   * Cerrar modal con confirmación si hay cambios
   */
  closeModalWithConfirmation(): void {
    if (this.hasFormChanges()) {
      Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres descartar los cambios?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1e40af',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando',
        background: '#ffffff',
        color: '#000000'
      }).then((result) => {
        if (result.isConfirmed) {
          this.closeModal();
        }
      });
    } else {
      this.closeModal();
    }
  }

  /**
   * Verificar si hay cambios en el formulario
   */
  hasFormChanges(): boolean {
    if (!this.isEditMode) {
      return !!(this.locationForm.name || this.locationForm.address || 
               this.locationForm.description || this.locationForm.googleMapsUrl);
    }
    
    if (!this.selectedLocation) return false;
    
    return this.locationForm.name !== this.selectedLocation.name ||
           this.locationForm.address !== this.selectedLocation.address ||
           this.locationForm.description !== this.selectedLocation.description ||
           this.locationForm.googleMapsUrl !== this.selectedLocation.googleMapsUrl;
  }

  /**
   * Verificar si el formulario es válido
   */
  isFormValid(): boolean {
    return !!(this.locationForm.name && 
              this.locationForm.name.trim() && 
              this.locationForm.address && 
              this.locationForm.address.trim());
  }

  /**
   * Guardar ubicación (crear o editar)
   */
  saveLocation(): void {
    if (!this.isFormValid()) {
      this.showErrorAlert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.selectedLocation) {
      // Editar ubicación existente
      const updateData: MapLocationUpdate = {
        name: this.locationForm.name?.trim(),
        address: this.locationForm.address?.trim(),
        description: this.locationForm.description?.trim(),
        googleMapsUrl: this.locationForm.googleMapsUrl?.trim()
      };

      this.mapLocationService.updateLocation(this.selectedLocation.id, updateData).subscribe({
        next: (updatedLocation) => {
          const index = this.locations.findIndex(l => l.id === updatedLocation.id);
          if (index !== -1) {
            this.locations[index] = updatedLocation;
          }
          this.applyFilters();
          this.showSuccessAlert('Ubicación actualizada correctamente');
          this.closeModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al actualizar ubicación:', error);
          this.showErrorAlert('Error al actualizar la ubicación');
          this.isLoading = false;
        }
      });
    } else {
      // Crear nueva ubicación
      const createData: MapLocationCreate = {
        name: this.locationForm.name?.trim() || '',
        address: this.locationForm.address?.trim() || '',
        description: this.locationForm.description?.trim(),
        googleMapsUrl: this.locationForm.googleMapsUrl?.trim() || '',
        authorId: this.currentUser?.id || 0
      };

      this.mapLocationService.createLocation(createData).subscribe({
        next: (newLocation) => {
          this.locations.unshift(newLocation);
          this.applyFilters();
          this.showSuccessAlert('Ubicación creada correctamente');
          this.closeModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al crear ubicación:', error);
          this.showErrorAlert('Error al crear la ubicación');
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Alternar estado de la ubicación (visible/oculta)
   */
  toggleLocationState(location: MapLocation): void {
    const newState = !location.state;
    const actionText = newState ? 'mostrar' : 'ocultar';
    
    Swal.fire({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ubicación?`,
      text: `¿Estás seguro de que quieres ${actionText} "${location.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e40af',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#000000'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mapLocationService.toggleLocationState(location.id).subscribe({
          next: () => {
            location.state = newState;
            this.applyFilters();
            this.showSuccessAlert(`Ubicación ${newState ? 'mostrada' : 'ocultada'} correctamente`);
          },
          error: (error) => {
            console.error('Error al cambiar estado de ubicación:', error);
            this.showErrorAlert('Error al cambiar el estado de la ubicación');
          }
        });
      }
    });
  }

  /**
   * Eliminar ubicación
   */
  deleteLocation(location: MapLocation): void {
    Swal.fire({
      title: '¿Eliminar ubicación?',
      text: `¿Estás seguro de que quieres eliminar "${location.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#000000'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mapLocationService.deleteLocation(location.id).subscribe({
          next: () => {
            this.locations = this.locations.filter(l => l.id !== location.id);
            this.applyFilters();
            this.showSuccessAlert('Ubicación eliminada correctamente');
          },
          error: (error) => {
            console.error('Error al eliminar ubicación:', error);
            this.showErrorAlert('Error al eliminar la ubicación');
          }
        });
      }
    });
  }

  /**
   * Abrir Google Maps
   */
  openGoogleMaps(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  /**
   * Resetear formulario
   */
  resetForm(): void {
    this.locationForm = {
      name: '',
      address: '',
      description: '',
      googleMapsUrl: '',
      authorId: this.currentUser?.id || 0
    };
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Truncar texto
   */
  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Verificar si hay filtros aplicados
   */
  hasFiltersApplied(): boolean {
    return this.searchTerm.trim() !== '' || this.stateFilter !== 'all';
  }

  /**
   * Verificar si mostrar mensaje de "crear primera"
   */
  shouldShowCreateFirstMessage(): boolean {
    return this.locations.length === 0 && !this.hasFiltersApplied();
  }

  /**
   * Mostrar alerta de éxito
   */
  private showSuccessAlert(message: string): void {
    Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#1e40af',
      confirmButtonText: 'Aceptar',
      background: '#ffffff',
      color: '#000000',
      timer: 3000,
      timerProgressBar: true
    });
  }

  /**
   * Mostrar alerta de error
   */
  private showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Aceptar',
      background: '#ffffff',
      color: '#000000'
    });
  }
} 