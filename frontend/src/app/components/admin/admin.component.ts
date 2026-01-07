import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { NewsService } from '../../services/news.service';
import { CalendarService } from '../../services/calendar.service';
import { TicketService } from '../../services/ticket.service';
import { DonationService } from '../../services/donation.service';
import { MapLocationService } from '../../services/map-location.service';
import { NewsManagementComponent } from './news-management/news-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { CalendarManagementComponent } from './calendar-management/calendar-management.component';
import { MapManagementComponent } from './map-management/map-management.component';
import { TicketManagementComponent } from './ticket-management/ticket-management.component';
import { DonationManagementComponent } from './donation-management/donation-management.component';

interface Stats {
  totalUsers: number;
  totalNews: number;
  totalEvents: number;
  totalTickets: number;
  totalDonations: number;
  totalLocations: number;
  pendingDonations: number;
  ticketsSold: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    NewsManagementComponent, 
    UserManagementComponent, 
    CalendarManagementComponent, 
    MapManagementComponent, 
    TicketManagementComponent, 
    DonationManagementComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isAdmin = false;
  activeTab = 'dashboard';
  loading = false;
  
  stats: Stats = {
    totalUsers: 0,
    totalNews: 0,
    totalEvents: 0,
    totalTickets: 0,
    totalDonations: 0,
    totalLocations: 0,
    pendingDonations: 0,
    ticketsSold: 0
  };

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private userService: UserService,
    private newsService: NewsService,
    private calendarService: CalendarService,
    private ticketService: TicketService,
    private donationService: DonationService,
    private mapLocationService: MapLocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      const currentUser = this.authService.getCurrentUserValue();
      if (currentUser?.role === 'admin') {
        this.isAdmin = true;
        this.loadStats();
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.router.navigate(['/']);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getTabClass(tab: string): string {
    return this.activeTab === tab ? 'active' : '';
  }

  getTabTitle(): string {
    const titles: { [key: string]: string } = {
      'dashboard': 'Panel de Control',
      'usuarios': 'Gestión de Usuarios',
      'noticias': 'Gestión de Noticias',
      'calendario': 'Gestión de Calendario',
      'entradas': 'Gestión de Entradas',
      'donaciones': 'Gestión de Donaciones',
      'mapa': 'Gestión de Mapa'
    };
    return titles[this.activeTab] || 'Panel de Administración';
  }

  loadStats(): void {
    this.loading = true;
    
    try {
      // Cargar usuarios
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.stats.totalUsers = Array.isArray(users) ? users.length : 0;
        },
        error: (error) => {
          console.error('Error cargando usuarios:', error);
          this.stats.totalUsers = 0;
        }
      });

      // Cargar noticias
      this.newsService.getAllNews().subscribe({
        next: (news) => {
          this.stats.totalNews = Array.isArray(news) ? news.length : 0;
        },
        error: (error) => {
          console.error('Error cargando noticias:', error);
          this.stats.totalNews = 0;
        }
      });

      // Cargar eventos
      this.calendarService.getAllEvents().subscribe({
        next: (events) => {
          const eventsArray = Array.isArray(events) ? events : [];
          this.stats.totalEvents = this.getEventsThisMonth(eventsArray);
        },
        error: (error) => {
          console.error('Error cargando eventos:', error);
          this.stats.totalEvents = 0;
        }
      });

      // Cargar tickets
      this.ticketService.getAllTickets().subscribe({
        next: (tickets) => {
          const ticketsArray = Array.isArray(tickets) ? tickets : [];
          this.stats.totalTickets = this.getAvailableTickets(ticketsArray);
          this.stats.ticketsSold = this.getSoldTickets(ticketsArray);
        },
        error: (error) => {
          console.error('Error cargando tickets:', error);
          this.stats.totalTickets = 0;
          this.stats.ticketsSold = 0;
        }
      });

      // Cargar donaciones
      this.donationService.getAllDonations().subscribe({
        next: (donations) => {
          const donationsArray = Array.isArray(donations) ? donations : [];
          this.stats.pendingDonations = this.getPendingDonations(donationsArray);
        },
        error: (error) => {
          console.error('Error cargando donaciones:', error);
          this.stats.pendingDonations = 0;
        }
      });

      // Cargar estadísticas de donaciones
      this.donationService.getDonationStatistics().subscribe({
        next: (donationStats) => {
          this.stats.totalDonations = donationStats?.totalAmount || 0;
        },
        error: (error) => {
          console.error('Error cargando estadísticas de donaciones:', error);
          this.stats.totalDonations = 0;
        }
      });

      // Cargar ubicaciones del mapa
      this.mapLocationService.getAllLocations().subscribe({
        next: (locations) => {
          this.stats.totalLocations = Array.isArray(locations) ? locations.length : 0;
        },
        error: (error) => {
          console.error('Error cargando ubicaciones:', error);
          this.stats.totalLocations = 0;
        }
      });

    } catch (error) {
      console.error('Error general cargando estadísticas:', error);
    } finally {
      this.loading = false;
    }
  }

  refreshStats(): void {
    try {
      this.notificationService.toast('info', 'Actualizando estadísticas...');
      this.loadStats();
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }

  private getEventsThisMonth(events: any[]): number {
    try {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      return events.filter(event => {
        try {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === thisMonth && eventDate.getFullYear() === thisYear;
        } catch {
          return false;
        }
      }).length;
    } catch {
      return 0;
    }
  }

  private getAvailableTickets(tickets: any[]): number {
    try {
      return tickets.filter(ticket => ticket && ticket.available === true).length;
    } catch {
      return 0;
    }
  }

  private getSoldTickets(tickets: any[]): number {
    try {
      return tickets.filter(ticket => ticket && ticket.available === false).length;
    } catch {
      return 0;
    }
  }

  private getPendingDonations(donations: any[]): number {
    try {
      return donations.filter(donation => donation && donation.purchase_state === 'pending').length;
    } catch {
      return 0;
    }
  }
} 