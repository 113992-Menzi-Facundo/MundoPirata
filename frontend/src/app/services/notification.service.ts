import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {}

  // Configuración base para SweetAlert con la estética de Belgrano
  private getBaseConfig() {
    return {
      customClass: {
        popup: 'belgrano-popup',
        title: 'belgrano-title',
        content: 'belgrano-content',
        confirmButton: 'belgrano-btn-primary',
        cancelButton: 'belgrano-btn-secondary',
        denyButton: 'belgrano-btn-danger'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#2c3e50',
      iconColor: '#007bff'
    };
  }

  // Notificación de éxito
  success(title: string, message?: string): Promise<any> {
    return Swal.fire({
      ...this.getBaseConfig(),
      icon: 'success',
      title: title,
      text: message,
      confirmButtonText: 'Perfecto',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      iconColor: '#28a745'
    });
  }

  // Notificación de error
  error(title: string, message?: string): Promise<any> {
    return Swal.fire({
      ...this.getBaseConfig(),
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: 'Entendido',
      iconColor: '#dc3545'
    });
  }

  // Notificación de advertencia
  warning(title: string, message?: string): Promise<any> {
    return Swal.fire({
      ...this.getBaseConfig(),
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonText: 'OK',
      iconColor: '#ffc107'
    });
  }

  // Notificación de información
  info(title: string, message?: string): Promise<any> {
    const config: any = {
      ...this.getBaseConfig(),
      icon: 'info',
      title: title,
      confirmButtonText: 'Entendido',
      iconColor: '#17a2b8'
    };

    // Si el mensaje contiene HTML, usar html en lugar de text
    if (message && message.includes('<')) {
      config.html = message;
    } else if (message) {
      config.text = message;
    }

    return Swal.fire(config);
  }

  // Confirmación de eliminación
  confirmDelete(itemName: string, message?: string): Promise<any> {
    return Swal.fire({
      ...this.getBaseConfig(),
      icon: 'warning',
      title: '¿Estás seguro?',
      text: message || `Esta acción eliminará "${itemName}" de forma permanente.`,
      html: `
        <div class="delete-confirmation">
          <p>${message || `Esta acción eliminará <strong>"${itemName}"</strong> de forma permanente.`}</p>
          <p class="text-muted">Esta acción no se puede deshacer.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      iconColor: '#ffc107'
    });
  }

  // Confirmación genérica
  confirm(title: string, message: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<any> {
    const config: any = {
      ...this.getBaseConfig(),
      icon: 'question',
      title: title,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      iconColor: '#007bff'
    };

    // Si el mensaje contiene HTML, usar html en lugar de text
    if (message && message.includes('<')) {
      config.html = message;
    } else {
      config.text = message;
    }

    return Swal.fire(config);
  }

  // Toast para notificaciones rápidas
  toast(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'belgrano-toast',
        title: 'belgrano-toast-title'
      },
      background: type === 'success' ? '#d4edda' : 
                 type === 'error' ? '#f8d7da' : 
                 type === 'warning' ? '#fff3cd' : '#d1ecf1',
      color: type === 'success' ? '#155724' : 
             type === 'error' ? '#721c24' : 
             type === 'warning' ? '#856404' : '#0c5460',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  }

  // Loading/Spinner
  showLoading(title: string = 'Cargando...', message?: string): void {
    Swal.fire({
      ...this.getBaseConfig(),
      title: title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Cerrar loading
  hideLoading(): void {
    Swal.close();
  }

  // Notificación de acción exitosa con detalles
  actionSuccess(action: string, itemName: string, details?: string): Promise<any> {
    return Swal.fire({
      ...this.getBaseConfig(),
      icon: 'success',
      title: `${action} exitoso`,
      html: `
        <div class="action-success">
          <p><strong>"${itemName}"</strong> ha sido ${action.toLowerCase()} correctamente.</p>
          ${details ? `<p class="text-muted">${details}</p>` : ''}
        </div>
      `,
      confirmButtonText: 'Continuar',
      timer: 4000,
      timerProgressBar: true,
      iconColor: '#28a745'
    });
  }

  // Notificación de error de formulario
  formError(errors: string[]): Promise<any> {
    const errorList = errors.map(error => `<li>${error}</li>`).join('');
    
    return Swal.fire({
      ...this.getBaseConfig(),
      icon: 'error',
      title: 'Error en el formulario',
      html: `
        <div class="form-errors">
          <p>Por favor, corrige los siguientes errores:</p>
          <ul class="text-start">${errorList}</ul>
        </div>
      `,
      confirmButtonText: 'Revisar',
      iconColor: '#dc3545'
    });
  }
} 