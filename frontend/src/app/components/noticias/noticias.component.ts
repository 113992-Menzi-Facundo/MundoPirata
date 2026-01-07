import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService, News, NewsType } from '../../services/news.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent implements OnInit {
  news: News[] = [];
  filteredNews: News[] = [];
  newsTypes: NewsType[] = [];
  isLoading = false;
  error = '';
  searchTerm = '';
  selectedCategory = 'Todas las categorías';
  
  // Categorías que se cargan desde la base de datos
  categories: string[] = ['Todas las categorías'];

  constructor(
    private newsService: NewsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadNewsTypes(); // Cargar tipos primero
    this.loadNews();
  }

  /**
   * Cargar tipos de noticias desde la base de datos
   */
  loadNewsTypes() {
    this.newsService.getNewsTypes().subscribe({
      next: (types) => {
        this.newsTypes = types;
        this.categories = ['Todas las categorías', ...types.map(type => type.type)];
        console.log('📑 Tipos de noticias cargados para filtro público:', types);
      },
      error: (error) => {
        console.error('Error cargando tipos de noticias:', error);
        // Si no se pueden cargar los tipos, usar filtro básico
        this.categories = ['Todas las categorías'];
      }
    });
  }

  loadNews() {
    this.isLoading = true;
    this.error = '';
    
    this.newsService.getAllActiveNews().subscribe({
      next: (data) => {
        this.news = data;
        this.applyFilters(); // Usar método unificado de filtros
        this.isLoading = false;
        console.log('📰 Noticias públicas cargadas:', data.length);
      },
      error: (error) => {
        console.error('Error cargando noticias:', error);
        this.error = 'Error al cargar las noticias. Por favor, intenta nuevamente.';
        this.isLoading = false;
        this.notificationService.error(
          'Error al cargar noticias',
          'No se pudieron cargar las noticias. Verifica tu conexión e intenta nuevamente.'
        );
      }
    });
  }

  /**
   * Aplicar filtros de búsqueda y categoría
   */
  applyFilters() {
    let filtered = [...this.news];

    // Filtro por búsqueda de texto
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(searchLower) ||
        news.content.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoría (tipo de noticia)
    if (this.selectedCategory !== 'Todas las categorías') {
      filtered = filtered.filter(news => 
        news.typeDescription === this.selectedCategory
      );
    }

    this.filteredNews = filtered;
    
    console.log('🔍 Filtros aplicados en noticias públicas:', {
      searchTerm: this.searchTerm,
      selectedCategory: this.selectedCategory,
      totalNews: this.news.length,
      filteredNews: this.filteredNews.length
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onCategoryChange() {
    console.log('🔄 Cambio de categoría en noticias públicas:', this.selectedCategory);
    this.applyFilters();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getNewsImage(news: News): string {
    // Imágenes basadas en el tipo real de noticia
    switch (news.typeDescription) {
      case 'Partidos':
        return 'assets/stadium.jpg';
      case 'Fichajes':
        return 'assets/banner.jpg';
      case 'Noticias del Club':
        return 'assets/logo.png';
      case 'Eventos':
        return 'assets/belvstall.jpg';
      case 'Comunicados Oficiales':
        return 'assets/logonegro.png';
      default:
        return 'assets/logo.png';
    }
  }

  truncateContent(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  viewNewsDetail(news: News) {
    // Mostrar el detalle completo de la noticia usando SweetAlert
    const formattedDate = this.formatDate(news.date);
    const authorInfo = news.authorName ? `<p class="text-muted mb-2"><strong>Autor:</strong> ${news.authorName}</p>` : '';
    const categoryInfo = `<p class="text-muted mb-2"><strong>Categoría:</strong> ${news.typeDescription}</p>`;
    const dateInfo = `<p class="text-muted mb-3"><strong>Fecha:</strong> ${formattedDate}</p>`;
    
    const htmlContent = `
      <div class="news-detail-content text-start">
        ${categoryInfo}
        ${authorInfo}
        ${dateInfo}
        <div class="news-content">
          ${news.content.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
    
    this.notificationService.info(news.title, htmlContent).then((result) => {
      // Si el usuario confirma, se puede implementar navegación a página de detalle
      if (result.isConfirmed) {
        console.log('Ver detalle completo de noticia:', news);
      }
    });
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * Refrescar noticias
   */
  refreshNews() {
    this.loadNews();
  }

  /**
   * Obtener estadísticas de noticias
   */
  getNewsStats() {
    return {
      total: this.news.length,
      filtered: this.filteredNews.length,
      hasFilter: this.searchTerm.trim() !== '' || this.selectedCategory !== 'Todas las categorías'
    };
  }

  /**
   * TrackBy function para optimizar el rendimiento del ngFor
   */
  trackByNewsId(index: number, news: News): number {
    return news.id;
  }

  /**
   * Obtener clase del badge según la categoría
   */
  getNewsBadgeClass(category: string): string {
    switch (category) {
      case 'Partidos':
        return 'badge-success';
      case 'Fichajes':
        return 'badge-warning';
      case 'Noticias del Club':
        return 'badge-primary';
      case 'Eventos':
        return 'badge-info';
      case 'Comunicados Oficiales':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  /**
   * Obtener icono según la categoría
   */
  getNewsIcon(category: string): string {
    switch (category) {
      case 'Partidos':
        return 'fas fa-futbol';
      case 'Fichajes':
        return 'fas fa-handshake';
      case 'Noticias del Club':
        return 'fas fa-newspaper';
      case 'Eventos':
        return 'fas fa-calendar-alt';
      case 'Comunicados Oficiales':
        return 'fas fa-bullhorn';
      default:
        return 'fas fa-info-circle';
    }
  }
} 