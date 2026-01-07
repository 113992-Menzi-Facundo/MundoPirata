import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EventType {
  id: number;
  type: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  detail?: string;
  authorId: number;
  authorName: string;
  date: string; // ISO date string
  eventTypeId: number;
  eventTypeDescription: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventCreate {
  title: string;
  detail?: string;
  authorId: number;
  date: string; // ISO date string
  eventTypeId: number;
}

export interface CalendarEventUpdate {
  title?: string;
  detail?: string;
  date?: string; // ISO date string
  eventTypeId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly API_URL = `${environment.apiUrl}/api/calendar`;
  private readonly EVENT_TYPES_URL = `${environment.apiUrl}/api/event-types`;

  constructor(private http: HttpClient) {}

  // Métodos públicos (sin autenticación)
  getAllActiveEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.API_URL}/public`);
  }

  getEventById(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.API_URL}/public/${id}`);
  }

  getUpcomingEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.API_URL}/public/upcoming`);
  }

  getEventsByDate(date: string): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.API_URL}/public/date/${date}`);
  }

  // Métodos administrativos (requieren autenticación)
  getAllEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.API_URL);
  }

  createEvent(eventData: CalendarEventCreate): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.API_URL, eventData);
  }

  updateEvent(id: number, eventData: CalendarEventUpdate): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.API_URL}/${id}`, eventData);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  toggleEventState(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/toggle-state`, {});
  }

  getEventsByType(typeId: number): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.API_URL}/type/${typeId}`);
  }

  // Tipos de eventos
  getAllEventTypes(): Observable<EventType[]> {
    return this.http.get<EventType[]>(this.EVENT_TYPES_URL);
  }
} 