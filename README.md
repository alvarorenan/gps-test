# GPS E-Commerce Test Project

A full-stack e-commerce application built with .NET 6, Angular 18, and PostgreSQL, containerized with Docker.

## 🚀 Overview

This is a CRUD-based e-commerce system that manages clients, products, and orders. The application features a complete order lifecycle with status tracking (Created, Paid, Canceled) and maintains a full audit history of all system operations.

## 🛠 Technologies Used

### Backend (.NET 6)
- **ASP.NET Core Web API** - RESTful API with minimal APIs
- **Entity Framework Core** - ORM with PostgreSQL provider
- **PostgreSQL** - Robust relational database
- **Docker** - Containerization for consistent deployment

### Frontend (Angular 18)
- **Angular 18** - Modern web framework with standalone components
- **Bootstrap 5** - Responsive UI framework
- **Nginx** - High-performance web server for production

### Why These Technologies?

- **.NET 6**: Cross-platform, high-performance, enterprise-ready
- **Angular 18**: Latest features with standalone components and signals
- **PostgreSQL**: ACID compliance, excellent performance, open-source
- **Docker**: Environment consistency, easy deployment, scalability
- **Nginx**: Lightweight, fast static file serving, perfect for SPAs

## 📋 Features

- **Client Management**: Create and list clients with CPF validation
- **Product Management**: Create and list products with pricing
- **Order Management**: Create orders, track status, calculate totals
- **Order Operations**: Pay and cancel orders with status updates
- **Audit History**: Complete system activity logging
- **Responsive Design**: Mobile-friendly Bootstrap interface
- **CORS Support**: Proper cross-origin configuration

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular 18    │    │   .NET 6 API    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   Port: 80      │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Make (optional, for convenience)

### Option 1: Using Makefile
```bash
# Start all services
make up

# Stop all services
make down

# View logs
make logs

# Rebuild and restart
make restart
```

### Option 2: Using Docker Compose Directly
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up --build -d
```

## 📱 Usage

1. **Access the application**: http://localhost
2. **Backend API**: http://localhost:8080
3. **Database**: localhost:5432 (postgres/postgres)

### Navigation
- **Clients**: Manage customer data
- **Products**: Manage product catalog
- **Orders**: View all orders with filtering
- **New Order**: Create new orders
- **History**: View system audit log

## 🗃 Database Schema

### Entities
- **Client**: ID, Name, CPF
- **Product**: ID, Name, Price
- **Order**: ID, ClientID, ProductIDs[], CreatedAt, Status
- **History**: ID, EntityID, EntityType, Action, DataSnapshot, Timestamp

### Order Status Flow
```
Created → Paid
Created → Canceled
```

## 🔧 Development

### Project Structure
```
├── back/              # .NET 6 API
├── front/             # Angular 18 SPA
├── docker-compose.yml # Container orchestration
├── Makefile          # Development shortcuts
└── README.md         # This file
```

### API Endpoints
- `GET/POST /clients` - Client management
- `GET/POST /products` - Product management
- `GET/POST /orders` - Order management
- `POST /orders/{id}/pay` - Pay order
- `POST /orders/{id}/cancel` - Cancel order
- `GET /orders/{id}/total` - Calculate order total
- `GET /history` - System audit log

## 📋 Makefile Commands

```bash
make up       # Start all services
make down     # Stop all services
make restart  # Restart all services
make logs     # View all logs
make build    # Build all images
make clean    # Clean up containers and images
```

## 🐳 Docker Services

- **postgres**: PostgreSQL database with health checks
- **backend**: .NET 6 API with EF Core migrations
- **frontend**: Angular 18 SPA served by Nginx

## 🔒 Environment Variables

Default values are configured for development. For production, override:

- `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `ASPNETCORE_URLS`

## 🎯 Testing the Application

1. Create some clients with valid CPFs
2. Add products with prices
3. Create orders selecting clients and products
4. Test order operations (Pay/Cancel)
5. Check the history tab for audit logs

---

**Note**: This is a test project demonstrating modern full-stack development practices with containerization.
