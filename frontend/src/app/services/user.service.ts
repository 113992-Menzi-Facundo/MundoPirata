import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserAdminCreate, UserAdminUpdate } from './auth.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  // Obtener usuario por ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  // Buscar usuarios por nombre
  searchUsers(name: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/search?name=${encodeURIComponent(name)}`);
  }

  // Obtener usuarios por rol
  getUsersByRole(role: 'user' | 'admin'): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/role/${role}`);
  }

  // Crear usuario (admin)
  createUser(userData: UserAdminCreate): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/admin/create`, userData);
  }

  // Actualizar usuario (admin)
  updateUser(id: number, userData: UserAdminUpdate): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/admin/${id}`, userData);
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Actualizar solo el rol
  updateUserRole(id: number, role: 'user' | 'admin'): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}/role?role=${role}`, {});
  }
} 