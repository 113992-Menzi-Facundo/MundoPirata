import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { LoginRequest } from '../../../services/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.notificationService.warning(
        'Campos requeridos',
        'Por favor, completa tu email y contraseña para continuar.'
      );
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.notificationService.warning(
        'Email inválido',
        'Por favor, ingresa un email válido.'
      );
      return;
    }

    this.isLoading = true;

    const credentials: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading = false;
        
        this.notificationService.toast('success', `¡Bienvenido, ${response.user.name}!`);
        
        // Redirigir después de un breve delay para que se vea el toast
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.isLoading = false;
        
        let errorTitle = 'Error de autenticación';
        let errorMessage = '';
        
        if (error.status === 401) {
          errorTitle = 'Credenciales incorrectas';
          errorMessage = 'El email o la contraseña no son correctos. Verifica tus datos e intenta nuevamente.';
        } else if (error.status === 0) {
          errorTitle = 'Error de conexión';
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.';
        } else if (error.status === 403) {
          errorTitle = 'Acceso denegado';
          errorMessage = 'No tienes permisos para acceder a este recurso.';
        } else {
          errorTitle = 'Error inesperado';
          errorMessage = 'Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.';
        }
        
        this.notificationService.error(errorTitle, errorMessage);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 