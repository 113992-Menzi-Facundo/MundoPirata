export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  dni?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistration {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserUpdate {
  name: string;
  lastName: string;
  dni?: number;
}

// Interfaces para gestión de usuarios por admin
export interface UserAdminCreate {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  dni?: number;
}

export interface UserAdminUpdate {
  name: string;
  lastName: string;
  role: 'user' | 'admin';
  dni?: number;
}

export interface UserListResponse {
  users: User[];
}

// Interfaces para el sistema de entradas
export interface Ticket {
  id: number;
  calendarId: number;
  locationId: number;
  locationName: string;
  price: number;
  eventTitle: string;
  eventDate: string;
  availableCount: number;
  totalCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsByLocation {
  location: {
    id: number;
    name: string;
    price: number;
  };
  availableCount: number;
  totalCount: number;
}

export interface EventWithTickets {
  eventId: number;
  eventTitle: string;
  eventDetail: string;
  eventDate: string;
  eventType: string;
  tickets: TicketsByLocation[];
} 