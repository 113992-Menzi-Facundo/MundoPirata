# Mundo Pirata - Club Atlético Belgrano Management System

A comprehensive full-stack web application for managing Club Atlético Belgrano's operations, including ticket sales, donations, news, events, and user management.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Accessing the Application](#accessing-the-application)
- [Development](#development)
- [Production Deployment](#production-deployment)

## 🏆 About the Project

**Mundo Pirata** is a digital platform designed for Club Atlético Belgrano, one of Argentina's most beloved football clubs. The system provides a complete solution for:

- **Ticket Management**: Purchase and manage match tickets online
- **Donations**: Accept donations from supporters for various club initiatives
- **News & Events**: Publish and manage club news and calendar events
- **User Management**: Complete user registration, authentication, and role-based access control
- **Payment Processing**: Integrated MercadoPago payment gateway for secure transactions

The platform serves as the digital hub for the "Pirata" community, connecting fans with their club through modern web technology.

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 3.4.6
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: JPA/Hibernate
- **Security**: JWT Authentication
- **API Documentation**: OpenAPI/Swagger
- **Payment Integration**: MercadoPago SDK

### Frontend
- **Framework**: Angular 19
- **Language**: TypeScript
- **UI Library**: Bootstrap 5
- **Calendar**: FullCalendar
- **HTTP Client**: Angular HttpClient with RxJS

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Email Testing**: MailDev (development)
- **Web Server**: Nginx (production frontend)

## ✨ Features

### User Features
- User registration and authentication
- Profile management
- Ticket purchase with MercadoPago integration
- Donation system with multiple destinations
- News browsing and event calendar
- Interactive stadium map

### Admin Features
- User management (CRUD operations)
- Role-based access control (Admin/User)
- Ticket management
- News and event management
- Donation destination management
- Order and transaction monitoring

### Technical Features
- RESTful API architecture
- JWT-based authentication
- CORS configuration
- Email notifications (welcome, purchase confirmations, etc.)
- Responsive design
- Server-side rendering (SSR) support

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

For local development (without Docker):
- **Java 17** or higher
- **Maven 3.6+**
- **Node.js 18+** and npm
- **MySQL 8.0**

## 📁 Project Structure

```
Mundo Pirata/
├── backend/                 # Spring Boot backend application
│   ├── src/
│   │   └── main/
│   │       ├── java/        # Java source code
│   │       └── resources/
│   │           ├── application.properties
│   │           └── static/  # Static resources (images, etc.)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                # Angular frontend application
│   ├── src/
│   │   ├── app/            # Angular components and services
│   │   ├── assets/         # Images and static assets
│   │   └── environments/   # Environment configuration files
│   ├── Dockerfile
│   ├── angular.json
│   └── package.json
│
├── database/                # Database initialization scripts
│   ├── db-backup.sql       # Database backup/initialization
│   └── README.md
│
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

## 🚀 Getting Started

### Quick Start with Docker

The easiest way to run the entire application is using Docker Compose:

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd "Mundo Pirata"
   ```

2. **Place your database backup** (optional):
   - If you have a database backup, place it in the `database/` directory
   - The file should be named `db-backup.sql` or any `.sql` file
   - It will be automatically imported on first startup

3. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html
   - MailDev (Email Testing): http://localhost:1080
   - MySQL: localhost:3307

## 🐳 Docker Deployment

### Services Overview

The Docker Compose setup includes four main services:

1. **Database (MySQL 8.0)**
   - Container: `mundo_pirata_db`
   - Port: `3307:3306`
   - Automatically initializes with backup files from `database/` directory

2. **MailDev (Email Testing)**
   - Container: `mundo_pirata_maildev`
   - Web UI: `1080:1080`
   - SMTP: `1025:1025`
   - Catches all emails sent by the application for testing

3. **Backend (Spring Boot)**
   - Container: `mundo_pirata_backend`
   - Port: `8080:8080`
   - Connects to MySQL and MailDev services

4. **Frontend (Angular + Nginx)**
   - Container: `mundo_pirata_frontend`
   - Port: `4200:80`
   - Serves the Angular application

### Docker Commands

**Start all services:**
```bash
docker-compose up -d
```

**Stop all services:**
```bash
docker-compose down
```

**Stop and remove volumes (resets database):**
```bash
docker-compose down -v
```

**Rebuild and restart:**
```bash
docker-compose up --build -d
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

**Restart a specific service:**
```bash
docker-compose restart backend
```

## 🔧 Environment Variables

### Frontend Environment Variables

You can customize the frontend configuration by setting these environment variables:

```bash
# Backend API URL
API_URL=http://localhost:8080

# MercadoPago Public Key
MERCADOPAGO_PUBLIC_KEY=your-mercadopago-public-key
```

These can be set in a `.env` file or passed directly to docker-compose:

```bash
API_URL=http://your-backend-url:8080 docker-compose up --build
```

### Backend Environment Variables

The backend configuration can be overridden via environment variables in `docker-compose.yml`:

```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/mundo_pirata?...
SPRING_DATASOURCE_USERNAME: pirata
SPRING_DATASOURCE_PASSWORD: 2004
SPRING_MAIL_HOST: maildev
SPRING_MAIL_PORT: 1025
```

**Note**: Environment variables override values in `application.properties`.

## 💾 Database Setup

### Automatic Initialization

The MySQL container automatically executes any `.sql` files in the `database/` directory on **first startup only** (when the database is empty).

**To import a database backup:**

1. Place your `.sql` backup file in the `database/` directory
2. Ensure the file includes `USE mundo_pirata;` or targets the correct database
3. Start the containers:
   ```bash
   docker-compose down -v  # Remove existing volume
   docker-compose up -d
   ```

**Supported formats:**
- `.sql` - Plain SQL scripts
- `.sql.gz` - Compressed SQL files
- `.sh` - Shell scripts

### Manual Database Access

**Connect to MySQL:**
```bash
docker exec -it mundo_pirata_db mysql -u pirata -p2004 mundo_pirata
```

**Or using root:**
```bash
docker exec -it mundo_pirata_db mysql -u root -ptest-password
```

## 🌐 Accessing the Application

Once all containers are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:4200 | Main web application |
| **Backend API** | http://localhost:8080 | REST API endpoints |
| **API Docs** | http://localhost:8080/swagger-ui.html | Swagger UI documentation |
| **MailDev** | http://localhost:1080 | Email testing interface |
| **MySQL** | localhost:3307 | Database (use MySQL client) |

### Default Credentials

The application uses the database credentials configured in `docker-compose.yml`. For user accounts, you'll need to register through the application or check the database.

## 💻 Development

### Running Backend Locally (without Docker)

1. **Start MySQL** (or use Docker for MySQL only):
   ```bash
   docker-compose up -d db
   ```

2. **Update `application.properties`**:
   - Set `spring.datasource.url` to `jdbc:mysql://localhost:3307/mundo_pirata...`
   - Configure other settings as needed

3. **Run the application**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

### Running Frontend Locally (without Docker)

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Update environment**:
   - Edit `frontend/src/environments/environment.ts`
   - Set `apiUrl` to your backend URL

3. **Run development server**:
   ```bash
   npm start
   ```

   The application will be available at http://localhost:4200

## 🚢 Production Deployment

### Environment Configuration

For production deployment, update the following:

1. **Backend (`docker-compose.yml`)**:
   ```yaml
   environment:
     SPRING_DATASOURCE_URL: jdbc:mysql://your-db-host:3306/mundo_pirata...
     SPRING_MAIL_HOST: smtp.your-email-provider.com
     SPRING_MAIL_PORT: 587
     SPRING_MAIL_USERNAME: your-email@domain.com
     SPRING_MAIL_PASSWORD: your-email-password
     SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH: "true"
     SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE: "true"
   ```

2. **Frontend (`docker-compose.yml`)**:
   ```yaml
   build:
     args:
       API_URL: https://api.yourdomain.com
       MERCADOPAGO_PUBLIC_KEY: your-production-key
   ```

3. **Security**:
   - Use strong passwords for database
   - Configure proper CORS origins
   - Use HTTPS in production
   - Secure JWT secret key
   - Use production MercadoPago credentials

### Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start in detached mode
docker-compose up -d
```

## 📝 Additional Notes

### Email Testing

During development, all emails are caught by MailDev and can be viewed at http://localhost:1080. No actual emails are sent.

### Database Persistence

Database data is persisted in a Docker volume named `db`. To reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

### Troubleshooting

**Backend won't start:**
- Check if MySQL is healthy: `docker-compose ps`
- View backend logs: `docker-compose logs backend`
- Ensure database is initialized

**Frontend can't connect to backend:**
- Verify `API_URL` environment variable
- Check CORS configuration in backend
- Ensure backend is running and accessible

**Database connection issues:**
- Verify MySQL container is running: `docker-compose ps`
- Check database credentials in `docker-compose.yml`
- Ensure network connectivity between containers

## 📄 License

This project is proprietary software for Club Atlético Belgrano.

## 👥 Contributors

Developed for Club Atlético Belgrano - "El Pirata"

---

**¡Vamos Belgrano! 💙⚽**

