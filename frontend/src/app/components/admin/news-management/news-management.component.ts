import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService, News, NewsType, NewsCreate, NewsUpdate } from '../../../services/news.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-news-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './news-management.component.html',
  styleUrls: ['./news-management.component.css']
})
export class NewsManagementComponent implements OnInit {
  news: News[] = [];
  newsTypes: NewsType[] = [];
  filteredNews: News[] = [];
  selectedNews: News | null = null;
  isEditing = false;
  isCreating = false;
  searchTerm = '';
  selectedTypeFilter = '';
  selectedStateFilter = '';
  
  newsForm: FormGroup;
  
  constructor(
    private newsService: NewsService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.newsForm = this.fb.group({
      typeId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      date: ['']
    });
  }

  ngOnInit(): void {
    this.loadNewsTypes();
    this.loadNews();
  }

  loadNews(): void {
    this.notificationService.showLoading('Cargando noticias...');
    
    this.newsService.getAllNews().subscribe({
      next: (data) => {
        this.news = data;
        this.filteredNews = data;
        this.notificationService.hideLoading();
        console.log('📰 Noticias cargadas:', data.length);
      },
      error: (error) => {
        console.error('Error cargando noticias:', error);
        this.notificationService.hideLoading();
        this.notificationService.error(
          'Error al cargar noticias',
          'No se pudieron cargar las noticias. Verifica tu conexión e intenta nuevamente.'
        );
      }
    });
  }

  loadNewsTypes(): void {
    this.newsService.getNewsTypes().subscribe({
      next: (data) => {
        this.newsTypes = data;
        console.log('📑 Tipos de noticias cargados:', data);
      },
      error: (error) => {
        console.error('Error cargando tipos de noticias:', error);
        this.notificationService.error(
          'Error al cargar tipos',
          'No se pudieron cargar los tipos de noticias.'
        );
      }
    });
  }

  filterNews(): void {
    this.filteredNews = this.news.filter(news => {
      const matchesSearch = !this.searchTerm || 
        news.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        news.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedTypeFilter || 
        news.typeId.toString() === this.selectedTypeFilter;
      
      const matchesState = !this.selectedStateFilter || 
        (this.selectedStateFilter === 'active' && news.state) ||
        (this.selectedStateFilter === 'inactive' && !news.state);
      
      return matchesSearch && matchesType && matchesState;
    });
    
    console.log('🔍 Filtros aplicados - Resultados:', this.filteredNews.length, {
      searchTerm: this.searchTerm,
      selectedTypeFilter: this.selectedTypeFilter,
      selectedStateFilter: this.selectedStateFilter
    });
  }

  onSearchChange(): void {
    this.filterNews();
  }

  onTypeFilterChange(): void {
    console.log('🔄 Cambio en filtro de tipo:', this.selectedTypeFilter);
    this.filterNews();
  }

  onStateFilterChange(): void {
    console.log('🔄 Cambio en filtro de estado:', this.selectedStateFilter);
    this.filterNews();
  }

  createNews(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.selectedNews = null;
    this.newsForm.reset();
    this.newsForm.patchValue({
      date: new Date().toISOString().split('T')[0]
    });
  }

  editNews(news: News): void {
    this.selectedNews = news;
    this.isEditing = true;
    this.isCreating = false;
    this.newsForm.patchValue({
      typeId: news.typeId,
      title: news.title,
      content: news.content,
      date: news.date
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isCreating = false;
    this.selectedNews = null;
    this.newsForm.reset();
  }

  saveNews(): void {
    if (!this.newsForm.valid) {
      const errors: string[] = [];
      
      if (this.newsForm.get('typeId')?.invalid) {
        errors.push('Selecciona un tipo de noticia');
      }
      if (this.newsForm.get('title')?.invalid) {
        const titleErrors = this.newsForm.get('title')?.errors;
        if (titleErrors?.['required']) {
          errors.push('El título es obligatorio');
        } else if (titleErrors?.['minlength']) {
          errors.push('El título debe tener al menos 5 caracteres');
        }
      }
      if (this.newsForm.get('content')?.invalid) {
        const contentErrors = this.newsForm.get('content')?.errors;
        if (contentErrors?.['required']) {
          errors.push('El contenido es obligatorio');
        } else if (contentErrors?.['minlength']) {
          errors.push('El contenido debe tener al menos 20 caracteres');
        }
      }
      
      this.notificationService.formError(errors);
      return;
    }

    const formValue = this.newsForm.value;
    
    if (this.isCreating) {
      const newsCreate: NewsCreate = {
        typeId: formValue.typeId,
        title: formValue.title,
        content: formValue.content,
        authorId: this.authService.getCurrentUserValue()?.id || 1,
        date: formValue.date
      };

      this.notificationService.showLoading('Creando noticia...');

      this.newsService.createNews(newsCreate).subscribe({
        next: (createdNews) => {
          this.notificationService.hideLoading();
          this.notificationService.actionSuccess(
            'Noticia creada',
            createdNews.title,
            'La noticia ha sido publicada exitosamente.'
          ).then(() => {
            this.loadNews();
            this.cancelEdit();
          });
        },
        error: (error) => {
          this.notificationService.hideLoading();
          console.error('Error creando noticia:', error);
          this.notificationService.error(
            'Error al crear noticia',
            'No se pudo crear la noticia. Verifica los datos e intenta nuevamente.'
          );
        }
      });
    } else if (this.isEditing && this.selectedNews) {
      const newsUpdate: NewsUpdate = {
        typeId: formValue.typeId,
        title: formValue.title,
        content: formValue.content,
        date: formValue.date
      };

      this.notificationService.showLoading('Actualizando noticia...');

      this.newsService.updateNews(this.selectedNews.id, newsUpdate).subscribe({
        next: (updatedNews) => {
          this.notificationService.hideLoading();
          this.notificationService.actionSuccess(
            'Noticia actualizada',
            updatedNews.title,
            'Los cambios han sido guardados exitosamente.'
          ).then(() => {
            this.loadNews();
            this.cancelEdit();
          });
        },
        error: (error) => {
          this.notificationService.hideLoading();
          console.error('Error actualizando noticia:', error);
          this.notificationService.error(
            'Error al actualizar noticia',
            'No se pudieron guardar los cambios. Intenta nuevamente.'
          );
        }
      });
    }
  }

  toggleNewsState(news: News): void {
    const action = news.state ? 'desactivar' : 'activar';
    
    this.notificationService.confirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} noticia?`,
      `¿Estás seguro de que deseas ${action} "${news.title}"?`,
      `Sí, ${action}`,
      'Cancelar'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading(`${action.charAt(0).toUpperCase() + action.slice(1)}ando noticia...`);
        
        this.newsService.toggleNewsState(news.id).subscribe({
          next: () => {
            news.state = !news.state;
            this.filterNews();
            this.notificationService.hideLoading();
            this.notificationService.actionSuccess(
              'Estado cambiado',
              news.title,
              `La noticia ha sido ${news.state ? 'activada' : 'desactivada'} exitosamente.`
            );
          },
          error: (error) => {
            this.notificationService.hideLoading();
            console.error('Error cambiando estado de noticia:', error);
            this.notificationService.error(
              'Error al cambiar estado',
              'No se pudo cambiar el estado de la noticia. Intenta nuevamente.'
            );
          }
        });
      }
    });
  }

  deleteNews(news: News): void {
    this.notificationService.confirmDelete(
      news.title,
      'Esta acción eliminará la noticia de forma permanente.'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading('Eliminando noticia...');
        
        this.newsService.deleteNews(news.id).subscribe({
          next: () => {
            this.notificationService.hideLoading();
            this.notificationService.actionSuccess(
              'Noticia eliminada',
              news.title,
              'La noticia ha sido eliminada exitosamente.'
            ).then(() => {
              this.loadNews();
            });
          },
          error: (error) => {
            this.notificationService.hideLoading();
            console.error('Error eliminando noticia:', error);
            this.notificationService.error(
              'Error al eliminar noticia',
              'No se pudo eliminar la noticia. Intenta nuevamente.'
            );
          }
        });
      }
    });
  }

  getNewsTypeName(typeId: number): string {
    const type = this.newsTypes.find(t => t.id === typeId);
    return type ? type.type : 'Desconocido';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString('es-ES');
  }
} 