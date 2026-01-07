import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { UserRegistration } from '../../../services/auth.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;

  nombrePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
  emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  onSubmit(form: any) {
    // Validar campos básicos
    if (form.invalid || !this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.notificationService.warning(
        'Campos incompletos',
        'Por favor, completa todos los campos antes de continuar.'
      );
      return;
    }

    // Validaciones específicas
    const errors: string[] = [];

    if (!this.nombrePattern.test(this.firstName)) {
      errors.push('El nombre solo puede contener letras y espacios');
    }

    if (!this.nombrePattern.test(this.lastName)) {
      errors.push('El apellido solo puede contener letras y espacios');
    }

    if (!this.emailPattern.test(this.email)) {
      errors.push('Ingresa un email válido');
    }

    if (this.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (this.password !== this.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    if (errors.length > 0) {
      this.notificationService.formError(errors);
      return;
    }

    this.isLoading = true;

    const userData: UserRegistration = {
      name: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.isLoading = false;
        
        this.notificationService.success(
          '¡Registro exitoso!',
          `Bienvenido ${response.name}. Serás redirigido al login para iniciar sesión.`
        ).then(() => {
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1000);
        });
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.isLoading = false;
        
        let errorTitle = 'Error en el registro';
        let errorMessage = '';
        
        if (error.status === 400) {
          errorTitle = 'Datos inválidos';
          errorMessage = 'Los datos ingresados no son válidos. Verifica la información e intenta nuevamente.';
        } else if (error.status === 409) {
          errorTitle = 'Usuario ya existe';
          errorMessage = 'Ya existe una cuenta con este email. Intenta con otro email o inicia sesión.';
        } else if (error.status === 0) {
          errorTitle = 'Error de conexión';
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.';
        } else {
          errorTitle = 'Error inesperado';
          errorMessage = 'Ocurrió un error inesperado durante el registro. Intenta nuevamente más tarde.';
        }
        
        this.notificationService.error(errorTitle, errorMessage);
      }
    });
  }
} 