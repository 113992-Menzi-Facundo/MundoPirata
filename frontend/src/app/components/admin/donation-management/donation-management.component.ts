import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DonationService, DonationResponse, Destination, DonationStats, DestinationCreateRequest } from '../../../services/donation.service';
import { NotificationService } from '../../../services/notification.service';
import Swal from 'sweetalert2';

// Usar los tipos del servicio
type Donation = DonationResponse;

@Component({
  selector: 'app-donation-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './donation-management.component.html',
  styleUrls: ['./donation-management.component.css']
})
export class DonationManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estados
  isLoading = false;
  isSubmitting = false;
  activeView: 'donations' | 'destinations' | 'stats' = 'donations';

  // Datos
  donations: Donation[] = [];
  destinations: Destination[] = [];
  stats: DonationStats = {
    totalDonations: 0,
    totalAmount: 0,
    monthlyAmount: 0,
    avgDonation: 0,
    destinationStats: []
  };

  // Filtros
  searchTerm = '';
  filterStatus = '';
  filterDestination = '';

  // Formularios
  destinationForm: FormGroup;

  // Estados de donación
  donationStates = [
    { value: 'pending', label: 'Pendiente', class: 'badge-warning' },
    { value: 'approved', label: 'Aprobada', class: 'badge-success' },
    { value: 'rejected', label: 'Rechazada', class: 'badge-danger' },
    { value: 'cancelled', label: 'Cancelada', class: 'badge-secondary' }
  ];

  constructor(
    private donationService: DonationService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.destinationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: [''],
      phoneNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // CARGA DE DATOS
  // =====================================================

  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadDonations(),
        this.loadDestinations(),
        this.loadStatistics()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.notificationService.error('Error', 'Error al cargar los datos del sistema');
    } finally {
      this.isLoading = false;
    }
  }

  async loadDonations(): Promise<void> {
    try {
      this.donationService.getAllDonations()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (donations: DonationResponse[]) => {
            this.donations = donations;
          },
          error: (error: any) => {
            console.error('Error cargando donaciones:', error);
            this.notificationService.error('Error', 'Error al cargar las donaciones');
          }
        });
    } catch (error) {
      console.error('Error en loadDonations:', error);
    }
  }

  async loadDestinations(): Promise<void> {
    try {
      this.donationService.getAllDestinations()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (destinations: Destination[]) => {
            this.destinations = destinations;
          },
          error: (error: any) => {
            console.error('Error cargando destinaciones:', error);
            this.notificationService.error('Error', 'Error al cargar las destinaciones');
          }
        });
    } catch (error) {
      console.error('Error en loadDestinations:', error);
    }
  }

  async loadStatistics(): Promise<void> {
    try {
      this.donationService.getDonationStatistics()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (stats: DonationStats) => {
            this.stats = stats;
          },
          error: (error: any) => {
            console.error('Error cargando estadísticas:', error);
            // Datos por defecto en caso de error
            this.stats = {
              totalDonations: 0,
              totalAmount: 0,
              monthlyAmount: 0,
              avgDonation: 0,
              destinationStats: []
            };
          }
        });
    } catch (error) {
      console.error('Error en loadStatistics:', error);
    }
  }

  // =====================================================
  // GESTIÓN DE DESTINACIONES
  // =====================================================

  /**
   * Agregar nueva destinación
   */
  async addDestination(): Promise<void> {
    if (this.destinationForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor completa todos los campos requeridos');
      return;
    }

    this.isSubmitting = true;
    try {
      const formData = this.destinationForm.value;
      
      this.donationService.createDestination(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newDestination: Destination) => {
            this.destinations.push(newDestination);
            this.destinationForm.reset();
            
            Swal.fire({
              icon: 'success',
              title: '¡Destinación agregada!',
              text: `Se agregó exitosamente la destinación "${newDestination.name}"`,
              background: '#f8f9fa',
              color: '#2c3e50',
              confirmButtonColor: '#3498db',
              confirmButtonText: 'Perfecto'
            });

            // Recargar estadísticas
            this.loadStatistics();
          },
          error: (error: any) => {
            console.error('Error agregando destinación:', error);
            this.notificationService.error('Error', 'Error al agregar la destinación. Intenta nuevamente.');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });

    } catch (error) {
      console.error('Error agregando destinación:', error);
      this.notificationService.error('Error', 'Error al agregar la destinación. Intenta nuevamente.');
      this.isSubmitting = false;
    }
  }

  /**
   * Cambiar estado de destinación (mostrar/ocultar)
   */
  async toggleDestinationState(destination: Destination): Promise<void> {
    const action = destination.state ? 'ocultar' : 'mostrar';
    
    const result = await Swal.fire({
      icon: 'question',
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} destinación?`,
      text: `¿Estás seguro de ${action} la destinación "${destination.name}"?`,
      showCancelButton: true,
      confirmButtonColor: destination.state ? '#e74c3c' : '#27ae60',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const originalState = destination.state;
        
        this.donationService.toggleDestinationState(destination.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updatedDestination: Destination) => {
              // Actualizar el estado con la respuesta del servidor
              destination.state = updatedDestination.state;
              const statusText = destination.state ? 'visible' : 'oculta';
              this.notificationService.success(
                'Estado actualizado',
                `La destinación "${destination.name}" ahora está ${statusText}`
              );
            },
            error: (error: any) => {
              console.error('Error actualizando destinación:', error);
              destination.state = originalState; // Mantener estado original
              this.notificationService.error('Error', 'No se pudo actualizar el estado de la destinación');
            }
          });
      } catch (error) {
        console.error('Error en toggleDestinationState:', error);
        this.notificationService.error('Error', 'Error al cambiar el estado de la destinación');
      }
    }
  }

  /**
   * Eliminar destinación
   */
  async deleteDestination(destination: Destination): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar destinación?',
      text: `¿Estás seguro de eliminar "${destination.name}"? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        this.donationService.deleteDestination(destination.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.destinations = this.destinations.filter(d => d.id !== destination.id);
              this.notificationService.success(
                'Destinación eliminada',
                `Se eliminó exitosamente "${destination.name}"`
              );
              this.loadStatistics(); // Recargar estadísticas
            },
            error: (error: any) => {
              console.error('Error eliminando destinación:', error);
              this.notificationService.error('Error', 'No se pudo eliminar la destinación');
            }
          });
      } catch (error) {
        console.error('Error en deleteDestination:', error);
        this.notificationService.error('Error', 'Error al eliminar la destinación');
      }
    }
  }

  // =====================================================
  // MÉTODOS DE FILTRADO Y UTILIDADES
  // =====================================================

  getFilteredDonations(): Donation[] {
    return this.donations.filter(donation => {
      const matchesSearch = !this.searchTerm || 
        donation.userName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        donation.destinationName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || donation.purchaseState === this.filterStatus;
      const matchesDestination = !this.filterDestination || donation.destinationId === parseInt(this.filterDestination);
      
      return matchesSearch && matchesStatus && matchesDestination;
    });
  }

  getFilteredDestinations(): Destination[] {
    return this.destinations.filter(destination => {
      return !this.searchTerm || 
        destination.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        destination.address?.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  getActiveDestinationsCount(): number {
    return this.destinations.filter(dest => dest.state).length;
  }

  getInactiveDestinationsCount(): number {
    return this.destinations.filter(dest => !dest.state).length;
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStateInfo(state: string) {
    return this.donationStates.find(s => s.value === state) || 
           { value: state, label: state, class: 'badge-secondary' };
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterDestination = '';
  }

  refresh(): void {
    this.loadData();
  }

  // =====================================================
  // MÉTODOS PARA ESTADÍSTICAS
  // =====================================================

  /**
   * Obtener el porcentaje de una destinación para la barra de progreso
   */
  getDestinationPercentage(amount: number): number {
    if (!this.stats.destinationStats || this.stats.destinationStats.length === 0) {
      return 0;
    }
    
    const maxAmount = Math.max(...this.stats.destinationStats.map(d => d.amount));
    return maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  }

  /**
   * Obtener cantidad de donaciones aprobadas
   */
  getApprovedDonationsCount(): number {
    return this.donations.filter(donation => donation.purchaseState === 'approved').length;
  }

  /**
   * Obtener cantidad de donaciones pendientes
   */
  getPendingDonationsCount(): number {
    return this.donations.filter(donation => donation.purchaseState === 'pending').length;
  }

  /**
   * Obtener top 5 destinaciones por monto recaudado
   */
  getTopDestinations(): any[] {
    if (!this.stats.destinationStats || this.stats.destinationStats.length === 0) {
      return [];
    }
    
    return this.stats.destinationStats
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  /**
   * Obtener clase de badge para el ranking
   */
  getTopBadgeClass(index: number): string {
    switch (index) {
      case 0: return 'bg-warning'; // Oro
      case 1: return 'bg-secondary'; // Plata
      case 2: return 'bg-dark'; // Bronce
      default: return 'bg-primary';
    }
  }
} 