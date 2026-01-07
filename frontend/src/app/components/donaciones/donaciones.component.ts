import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { 
  DonationService, 
  Destination, 
  DonationCreateRequest, 
  DonationResponse 
} from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-donaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donaciones.component.html',
  styleUrls: ['./donaciones.component.css']
})
export class DonacionesComponent implements OnInit, OnDestroy {
  // Estado del formulario
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  
  // Datos del formulario
  amount: number = 0;
  selectedDestinationId: number | null = null;
  paymentMethod = 'Mercado Pago';
  
  // Datos de destinos
  destinations: Destination[] = [];
  
  // Control de suscripciones
  private destroy$ = new Subject<void>();

  // Métodos de pago disponibles
  paymentMethods = [
    { value: 'Mercado Pago', label: 'Mercado Pago', icon: 'fas fa-credit-card' }
  ];

  // Montos sugeridos
  suggestedAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDestinations();

    // Manejar parámetros de retorno de MercadoPago
    this.handlePaymentReturn();
    
    // Verificar donaciones pendientes
    this.checkPendingDonations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Refrescar datos
   */
  refresh(): void {
    this.error = null;
    this.loadDestinations();
  }

  /**
   * Manejar parámetros de retorno de MercadoPago
   */
  private handlePaymentReturn(): void {
    this.route.queryParams.subscribe(params => {
      const payment = params['payment'];
      const donationId = params['donation'];
      const paymentId = params['payment_id'];
      
      if (payment && donationId) {
        switch (payment) {
          case 'success':
          case 'approved':
            // Procesar la donación automáticamente
            this.processCompletedDonation(donationId, payment, paymentId);
            
            Swal.fire({
              icon: 'success',
              title: '¡Donación exitosa! 💙',
              text: 'Tu donación ha sido procesada correctamente. Se envió un email de confirmación.',
              confirmButtonText: 'Continuar',
              confirmButtonColor: '#007bff'
            });
            break;
          case 'pending':
            Swal.fire({
              icon: 'info',
              title: 'Pago pendiente ⏳',
              text: 'Tu donación está siendo verificada. Te notificaremos por email cuando se confirme.',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#ffc107'
            });
            break;
          case 'failure':
            Swal.fire({
              icon: 'error',
              title: 'Error en el pago ❌',
              text: 'Tu pago no pudo ser procesado. Intenta nuevamente con otro medio de pago.',
              confirmButtonText: 'Intentar de nuevo',
              confirmButtonColor: '#dc3545'
            });
            break;
        }
        
        // Limpiar parámetros de URL
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }, 3000);
      }
    });
  }

  /**
   * Procesar donación completada - Aprobar donación y enviar email
   */
  private processCompletedDonation(donationId: string, paymentStatus: string, paymentId?: string): void {
    const donationIdNum = parseInt(donationId);
    
    this.donationService.processDonation(donationIdNum, paymentStatus, paymentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Donación procesada exitosamente:', result);
        },
        error: (error) => {
          console.error('Error procesando donación:', error);
        }
      });
  }

  /**
   * Cargar destinos de donación
   */
  loadDestinations(): void {
    this.isLoading = true;
    
    this.donationService.getDestinations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destinations) => {
          this.destinations = destinations.filter(d => d.state);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando destinos:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los destinos de donación.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
          });
          this.isLoading = false;
        }
      });
  }

  /**
   * Seleccionar monto sugerido
   */
  selectSuggestedAmount(amount: number): void {
    this.amount = amount;
  }

  /**
   * Validar formulario
   */
  validateForm(): { valid: boolean; message?: string } {
    if (!this.authService.isAuthenticated()) {
      return { valid: false, message: 'Debes iniciar sesión para realizar una donación' };
    }

    if (!this.selectedDestinationId) {
      return { valid: false, message: 'Selecciona un destino para tu donación' };
    }

    const amountValidation = this.donationService.validateDonationAmount(this.amount);
    if (!amountValidation.valid) {
      return amountValidation;
    }

    return { valid: true };
  }

  /**
   * Realizar donación
   */
  async onSubmit(): Promise<void> {
    const validation = this.validateForm();
    if (!validation.valid) {
      await Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: validation.message || 'Verifica los datos ingresados',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const user = this.authService.getCurrentUserValue();
    if (!user) {
      await Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'Debes iniciar sesión para continuar',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    this.isSubmitting = true;

    const donationData: DonationCreateRequest = {
      userId: user.id,
      destinationId: this.selectedDestinationId!,
      amount: this.amount,
      paymentMethod: this.paymentMethod
    };

    const selectedDestination = this.destinations.find(d => d.id === this.selectedDestinationId);

    // Confirmación con SweetAlert
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirmar donación',
      html: `
        <div style="text-align: left;">
          <p><strong>Destino:</strong> ${selectedDestination?.name}</p>
          <p><strong>Monto:</strong> ${this.donationService.formatPrice(this.amount)}</p>
          <p><strong>Método de pago:</strong> ${this.paymentMethod}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar donación',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d'
    });
    
    if (result.isConfirmed) {
      this.processDonation(donationData);
    } else {
      this.isSubmitting = false;
    }
  }

  /**
   * Procesar la donación
   */
  private processDonation(donationData: DonationCreateRequest): void {
    this.donationService.createDonation(donationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (donation) => {
          Swal.fire({
            icon: 'success',
            title: '¡Donación creada!',
            text: 'Tu donación ha sido registrada exitosamente.',
            confirmButtonText: 'Continuar al pago',
            confirmButtonColor: '#007bff'
          }).then(() => {
            // Proceder al pago
            this.initializePayment(donation.id);
          });
        },
        error: (error) => {
          console.error('Error creando donación:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al procesar donación',
            text: error.message || 'Ocurrió un error al crear la donación.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
          });
          this.isSubmitting = false;
        }
      });
  }

  /**
   * Inicializar proceso de pago
   */
  private initializePayment(donationId: number): void {
    if (this.paymentMethod === 'Mercado Pago') {
      const user = this.authService.getCurrentUserValue();
      if (!user) {
        this.isSubmitting = false;
        return;
      }

      // Usar el servicio original de MercadoPago
      this.donationService.createPaymentPreference(donationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response && response.checkoutUrl) {
              // Guardar información del pago pendiente
              if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                const paymentInfo = {
                  donationId: donationId,
                  userEmail: user.email,
                  preferenceId: response.preferenceId,
                  timestamp: new Date().toISOString(),
                  processed: false
                };
                localStorage.setItem('mundoPirata_pendingDonation', JSON.stringify(paymentInfo));
              }
              
              // Redirigir a MercadoPago
              window.open(response.checkoutUrl, '_blank');
              
              // Mostrar mensaje de procesamiento igual que en entradas
              this.showPaymentProcessingMessage(donationId, user.email);
              
              // Resetear formulario
              this.resetForm();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error en el pago',
                text: 'No se pudo generar la preferencia de pago.',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
              });
              this.isSubmitting = false;
            }
          },
          error: (error) => {
            console.error('Error creando preferencia de pago:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error en el pago',
              text: 'No se pudo inicializar el proceso de pago.',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#dc3545'
            });
            this.isSubmitting = false;
          }
        });
    } else {
      // Para otros métodos de pago
      Swal.fire({
        icon: 'info',
        title: 'Instrucciones de pago',
        text: 'Te enviaremos las instrucciones de transferencia por email.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#007bff'
      });
      this.resetForm();
    }
  }

  /**
   * Mostrar mensaje de procesamiento de pago (igual que en entradas)
   */
  private showPaymentProcessingMessage(donationId: number, userEmail: string): void {
    this.notificationService.confirm(
      '🔄 Procesando Donación',
      `<div class="text-center">
        <p><strong>¡Donación en proceso!</strong></p>
        <p>Tu donación está siendo procesada en MercadoPago.</p>
        <p>📧 Te llegará un email de confirmación cuando se complete el pago.</p>
        <p>💙 Si cerraste la ventana de MercadoPago y ya completaste la donación, haz clic en "Ya doné" para confirmar tu donación.</p>
      </div>`,
      'Ya doné',
      'Entendido'
    ).then((result) => {
      if (result.isConfirmed) {
        // Usuario dice que ya donó, verificar donación
        this.verifyAndProcessDonation(donationId, userEmail);
      } else {
        // Usuario entendió, verificar después de un tiempo
        setTimeout(() => {
          this.checkPendingDonationOnFocus();
        }, 5000);
      }
    });
  }

  /**
   * Verificar y procesar donación manualmente (igual que en entradas)
   */
  private verifyAndProcessDonation(donationId: number, userEmail: string): void {
    this.notificationService.confirm(
      '✅ Confirmar Donación',
      `<div class="text-center">
        <p>¿Completaste la donación en MercadoPago?</p>
        <p class="text-warning">⚠️ Solo confirma si realmente realizaste la donación</p>
      </div>`,
      'Sí, ya doné',
      'No, cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        // Procesar la donación como exitosa
        this.processCompletedDonation(donationId.toString(), 'success');
        
        // Limpiar donación pendiente
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('mundoPirata_pendingDonation');
        }
        
        // Mostrar éxito
        this.notificationService.success(
          '¡Donación Confirmada! 💙',
          'Tu donación fue procesada exitosamente. Se envió la confirmación a tu email.'
        );
        
        // Recargar destinos
        this.loadDestinations();
      }
    });
  }

  /**
   * Verificar donaciones pendientes cuando la ventana toma foco
   */
  private checkPendingDonationOnFocus(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return; // No ejecutar en servidor
    }
    
    const handleFocus = () => {
      const pendingDonation = localStorage.getItem('mundoPirata_pendingDonation');
      if (pendingDonation) {
        try {
          const donationInfo = JSON.parse(pendingDonation);
          if (!donationInfo.processed) {
            // Preguntar si el usuario completó la donación
            setTimeout(() => {
              this.verifyAndProcessDonation(donationInfo.donationId, donationInfo.userEmail);
            }, 1000);
          }
        } catch (error) {
          console.error('Error parsing pending donation:', error);
        }
      }
      window.removeEventListener('focus', handleFocus);
    };
    
    window.addEventListener('focus', handleFocus);
  }

  /**
   * Verificar donaciones pendientes al cargar el componente
   */
  private checkPendingDonations(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    const pendingDonation = localStorage.getItem('mundoPirata_pendingDonation');
    if (pendingDonation) {
      try {
        const donationInfo = JSON.parse(pendingDonation);
        if (!donationInfo.processed) {
          // Mostrar popup para verificar si completó la donación
          setTimeout(() => {
            this.verifyAndProcessDonation(donationInfo.donationId, donationInfo.userEmail);
          }, 2000);
        }
      } catch (error) {
        console.error('Error parsing pending donation:', error);
        localStorage.removeItem('mundoPirata_pendingDonation');
      }
    }
  }

  /**
   * Resetear formulario
   */
  resetForm(): void {
    this.amount = 0;
    this.selectedDestinationId = null;
    this.paymentMethod = 'Mercado Pago';
    this.isSubmitting = false;
  }

  /**
   * Obtener el destino seleccionado
   */
  getSelectedDestination(): Destination | null {
    if (!this.selectedDestinationId) return null;
    return this.destinations.find(d => d.id === this.selectedDestinationId) || null;
  }

  /**
   * Formatear precio
   */
  formatPrice(amount: number): string {
    return this.donationService.formatPrice(amount);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}