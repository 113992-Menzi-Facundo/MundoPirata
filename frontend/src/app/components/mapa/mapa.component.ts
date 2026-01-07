import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapLocationService, MapLocation } from '../../services/map-location.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit, OnDestroy {
  locations: MapLocation[] = [];
  filteredLocations: MapLocation[] = [];
  selectedLocation: MapLocation | null = null;
  isLoading = false;
  error: string | null = null;
  
  // Filtros y búsqueda
  searchTerm = '';
  showAllLocations = true;
  
  // Manejo de suscripciones
  private destroy$ = new Subject<void>();

  // Ubicación por defecto para mostrar en el mapa principal
  defaultMapLocation = {
    name: 'Estadio Julio César Villagra',
    address: 'Av. Arturo Orgaz 510, Córdoba, Argentina',
    description: 'Casa de los Piratas Celestes - Capacidad para 28,000 espectadores',
    image: 'assets/stadium.jpg'
  };

  constructor(private mapLocationService: MapLocationService) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar todas las ubicaciones activas
   */
  loadLocations(): void {
    this.isLoading = true;
    this.error = null;

    this.mapLocationService.getAllActiveLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => {
          this.locations = locations;
          this.filteredLocations = locations;
          this.isLoading = false;

          // Seleccionar la primera ubicación si existe
          if (locations.length > 0 && !this.selectedLocation) {
            this.selectLocation(locations[0]);
          }
        },
        error: (error) => {
          console.error('Error al cargar ubicaciones:', error);
          this.error = 'Error al cargar las ubicaciones. Mostrando datos de ejemplo.';
          this.loadFallbackData();
          this.isLoading = false;
        }
      });
  }

  /**
   * Datos de respaldo si falla la conexión
   */
  private loadFallbackData(): void {
    this.locations = [
      {
        id: 1,
        name: 'Estadio Julio César Villagra',
        address: 'Av. Arturo Orgaz 510, Córdoba, Argentina',
        description: 'Estadio oficial del Club Atlético Belgrano. Capacidad para 28,000 espectadores. Casa de los Piratas Celestes.',
        googleMapsUrl: 'https://maps.google.com/?q=Estadio+Julio+Cesar+Villagra+Cordoba',
        authorId: 1,
        authorName: 'Admin',
        state: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Sede Social Club Atlético Belgrano',
        address: 'Av. Arturo Orgaz 500, Córdoba, Argentina',
        description: 'Sede social principal del club con oficinas administrativas, salones de eventos y museo del club.',
        googleMapsUrl: 'https://maps.google.com/?q=Sede+Social+Belgrano+Cordoba',
        authorId: 1,
        authorName: 'Admin',
        state: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.filteredLocations = this.locations;
    if (this.locations.length > 0) {
      this.selectLocation(this.locations[0]);
    }
  }

  /**
   * Seleccionar una ubicación
   */
  selectLocation(location: MapLocation): void {
    this.selectedLocation = location;
  }

  /**
   * Aplicar filtro de búsqueda
   */
  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredLocations = this.locations;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredLocations = this.locations.filter(location =>
        location.name.toLowerCase().includes(term) ||
        location.address.toLowerCase().includes(term) ||
        (location.description && location.description.toLowerCase().includes(term))
      );
    }
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredLocations = this.locations;
  }

  /**
   * Abrir ubicación en Google Maps
   */
  openInGoogleMaps(location: MapLocation): void {
    window.open(location.googleMapsUrl, '_blank', 'noopener,noreferrer');
  }

  /**
   * Obtener icono según el tipo de ubicación
   */
  getLocationIcon(locationName: string): string {
    const name = locationName.toLowerCase();
    
    if (name.includes('estadio')) return 'fas fa-futbol';
    if (name.includes('sede') || name.includes('social')) return 'fas fa-building';
    if (name.includes('tienda') || name.includes('oficial')) return 'fas fa-store';
    if (name.includes('complejo') || name.includes('entrenamiento')) return 'fas fa-dumbbell';
    if (name.includes('centro') && name.includes('médico')) return 'fas fa-hospital';
    if (name.includes('monumento')) return 'fas fa-monument';
    if (name.includes('hotel')) return 'fas fa-bed';
    if (name.includes('casa') || name.includes('fundación')) return 'fas fa-home';
    
    return 'fas fa-map-marker-alt';
  }

  /**
   * Obtener color del badge según el tipo de ubicación
   */
  getLocationBadgeClass(locationName: string): string {
    const name = locationName.toLowerCase();
    
    if (name.includes('estadio')) return 'badge-primary';
    if (name.includes('sede') || name.includes('social')) return 'badge-info';
    if (name.includes('tienda') || name.includes('oficial')) return 'badge-success';
    if (name.includes('complejo') || name.includes('entrenamiento')) return 'badge-warning';
    if (name.includes('centro') && name.includes('médico')) return 'badge-danger';
    
    return 'badge-secondary';
  }

  /**
   * Truncar texto largo
   */
  truncateText(text: string, maxLength: number = 100): string {
    return this.mapLocationService.truncateText(text, maxLength);
  }

  /**
   * Refrescar ubicaciones
   */
  refreshLocations(): void {
    this.loadLocations();
  }

  /**
   * Obtener estadísticas
   */
  getLocationStats() {
    return {
      total: this.locations.length,
      filtered: this.filteredLocations.length,
      hasFilter: this.searchTerm.length > 0
    };
  }

  /**
   * TrackBy function para optimizar el rendimiento del ngFor
   */
  trackByLocationId(index: number, location: MapLocation): number {
    return location.id;
  }

  /**
   * Obtener imagen para la ubicación
   */
  getLocationImage(locationName: string): string {
    const name = locationName.toLowerCase();
    
    if (name.includes('estadio')) return 'assets/stadium.jpg';
    if (name.includes('sede') || name.includes('social')) return 'assets/banner.jpg';
    if (name.includes('tienda') || name.includes('oficial')) return 'assets/logo.png';
    if (name.includes('complejo') || name.includes('entrenamiento')) return 'assets/stadium.jpg';
    if (name.includes('centro') && name.includes('médico')) return 'assets/banner.jpg';
    if (name.includes('monumento')) return 'assets/stadium.jpg';
    if (name.includes('hotel')) return 'assets/banner.jpg';
    if (name.includes('casa') || name.includes('fundación')) return 'assets/banner.jpg';
    
    return 'assets/stadium.jpg'; // Imagen por defecto
  }

  /**
   * Obtener etiqueta del tipo de ubicación
   */
  getLocationTypeLabel(locationName: string): string {
    const name = locationName.toLowerCase();
    
    if (name.includes('estadio')) return 'Estadio';
    if (name.includes('sede') || name.includes('social')) return 'Sede Social';
    if (name.includes('tienda') || name.includes('oficial')) return 'Tienda Oficial';
    if (name.includes('complejo') || name.includes('entrenamiento')) return 'Centro Deportivo';
    if (name.includes('centro') && name.includes('médico')) return 'Centro Médico';
    if (name.includes('monumento')) return 'Monumento';
    if (name.includes('hotel')) return 'Hotel';
    if (name.includes('casa') || name.includes('fundación')) return 'Lugar Histórico';
    
    return 'Ubicación';
  }
} 