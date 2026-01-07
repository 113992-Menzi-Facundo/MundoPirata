import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { User } from '../../../services/auth.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoading = true;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si ya hay un usuario cargado
    const currentUserValue = this.authService.getCurrentUserValue();
    
    if (currentUserValue) {
      this.currentUser = currentUserValue;
      this.isLoading = false;
    } else if (this.authService.isAuthenticated()) {
      // Si está autenticado pero no tiene datos del usuario, obtenerlos
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUser = user;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error obteniendo datos del usuario:', error);
          this.isLoading = false;
          this.notificationService.error(
            'Error al cargar perfil',
            'No se pudo cargar la información del usuario. Inicia sesión nuevamente.'
          );
          // Si hay error, redirigir al login
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      // Si no está autenticado, redirigir al login
      this.isLoading = false;
      this.router.navigate(['/auth/login']);
    }

    // Suscribirse a los cambios del usuario actual
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  cerrarSesion() {
    this.notificationService.confirm(
      'Cerrar sesión',
      `¿Estás seguro de que quieres cerrar tu sesión${this.currentUser?.name ? ', ' + this.currentUser.name : ''}?`,
      'Sí, cerrar sesión',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.notificationService.toast('success', 'Sesión cerrada correctamente');
        
        // Pequeño delay para mostrar el toast antes de navegar
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
} 