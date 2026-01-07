import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewsType {
  id: number;
  type: string;
}

export interface News {
  id: number;
  typeId: number;
  typeDescription: string;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  date: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsCreate {
  typeId: number;
  title: string;
  content: string;
  authorId: number;
  date?: string;
}

export interface NewsUpdate {
  typeId?: number;
  title?: string;
  content?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/api/news`;

  constructor(private http: HttpClient) { }

  // Obtener tipos de noticias
  getNewsTypes(): Observable<NewsType[]> {
    return this.http.get<NewsType[]>(`${environment.apiUrl}/api/news-types`);
  }

  // Obtener todas las noticias activas (público)
  getAllActiveNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/public`);
  }

  // Obtener noticia por ID (público)
  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/public/${id}`);
  }

  // Buscar noticias por título (público)
  searchNewsByTitle(title: string): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/public/search?title=${encodeURIComponent(title)}`);
  }

  // Obtener todas las noticias (admin)
  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(this.apiUrl);
  }

  // Obtener noticias por tipo
  getNewsByType(typeId: number): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/type/${typeId}`);
  }

  // Crear nueva noticia (admin)
  createNews(news: NewsCreate): Observable<News> {
    return this.http.post<News>(this.apiUrl, news);
  }

  // Actualizar noticia (admin)
  updateNews(id: number, news: NewsUpdate): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/${id}`, news);
  }

  // Cambiar estado de noticia (admin)
  toggleNewsState(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/toggle-state`, {});
  }

  // Eliminar noticia (admin)
  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 