import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../services/auth.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios del usuario actual
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout() {
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