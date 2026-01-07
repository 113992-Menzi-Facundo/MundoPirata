# Mundo Pirata - Club Atlético Belgrano

Sistema de gestión para el Club Atlético Belgrano desarrollado como proyecto de tesis.

## 🎯 Funcionalidades

### Gestión de Usuarios
- ✅ Registro, modificación y consulta de usuarios
- ✅ Actualización de roles de usuario
- ✅ Notificaciones por email (alta de usuario y cambios de rol)

### Gestión de Calendario
- ✅ Registro, consulta, modificación y eliminación de eventos
- ✅ Actualización de fechas del calendario

### Gestión de Entradas
- ✅ Registro, consulta, modificación y eliminación de entradas
- ✅ Generación de reportes estadísticos de ventas
- ✅ Confirmación de compra por email
- ✅ Integración con MercadoPago

### Gestión de Noticias
- ✅ Registro, consulta, modificación y eliminación de noticias
- ✅ Actualización de estado de noticias

### Gestión de Donaciones
- ✅ Registro, consulta, modificación y eliminación de donaciones
- ✅ Actualización de estado de donaciones
- ✅ Generación de reportes de donaciones
- ✅ Integración con MercadoPago para donaciones

## 🛠️ Tecnologías

- **Backend**: Spring Boot 3.x, Java 17
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT
- **Pagos**: MercadoPago API
- **Frontend**: Angular 17

## 🚀 Instalación

### Requisitos
- Java 17+
- MySQL 8.0+
- Maven 3.6+

### Configuración
1. Clonar el repositorio
2. Configurar la base de datos MySQL
3. Actualizar `application.properties` con tus credenciales
4. Ejecutar: `mvn spring-boot:run`

### Base de Datos
```sql
-- Crear base de datos
CREATE DATABASE mundo_pirata;
USE mundo_pirata;

-- Ejecutar el script SQL incluido
source mundo_pirata_database.sql;
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `POST /api/users/register` - Registrar usuario
- `GET /api/users/{id}` - Obtener usuario
- `PUT /api/users/{id}` - Actualizar usuario

### Noticias (Públicas)
- `GET /api/news/public` - Obtener noticias activas
- `GET /api/news/public/{id}` - Obtener noticia por ID

### Calendario (Público)
- `GET /api/calendar/public` - Obtener eventos activos
- `GET /api/calendar/public/{id}` - Obtener evento por ID

### Entradas (Públicas)
- `GET /api/tickets/public` - Obtener entradas disponibles
- `GET /api/tickets/public/{id}` - Obtener entrada por ID

### Donaciones (Públicas)
- `GET /api/donations/public/{id}` - Obtener donación por ID

## 👤 Usuario de Prueba

- **Email**: `admin@mundopirata.com`
- **Password**: `admin123`

## 📧 Configuración de Email

Para habilitar las notificaciones por email, configurar en `application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu-email@gmail.com
spring.mail.password=tu-password-de-aplicacion
```

## 💳 Configuración de MercadoPago

Configurar las credenciales de MercadoPago en `application.properties`:

```properties
mercadopago.access.token=TU_ACCESS_TOKEN
mercadopago.public.key=TU_PUBLIC_KEY
mercadopago.client.id=TU_CLIENT_ID
```

## 🎨 Frontend

El frontend está desarrollado en Angular 17 y se encuentra en la carpeta `src/app/`.

### Instalación del Frontend
```bash
npm install
ng serve
```

## 📝 Autor

**Facundo Andrés Menzi** - Proyecto de Tesis

---

*Club Atlético Belgrano - Tu club, tu pasión* 