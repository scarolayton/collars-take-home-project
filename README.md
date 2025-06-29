# Task Management API

A serverless API for a simple task management system built with NestJS, TypeORM, and MySQL.

## Features

- **User Management**: Create, read, update, and delete users
- **Task Management**: Full CRUD operations for tasks with pagination and filtering
- **Task Assignment**: Assign tasks to users and view user-specific tasks
- **Authentication**: JWT-based authentication and authorization
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Comprehensive input validation and error handling
- **Database**: MySQL database with TypeORM integration

## Technical Stack

- **Node.js** (version 18 or higher)
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Object-Relational Mapping
- **MySQL** - Database (PostgreSQL or SQLite also supported)
- **JWT** - Authentication
- **Swagger** - API documentation
- **Jest** - Unit testing framework

## Prerequisites

- Node.js 18 or higher
- MySQL database
- Yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd take-home-collar
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit the `.env` file with your database configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=task_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

4. Create the database:
```sql
CREATE DATABASE task_management;
```

5. Run the application:
```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

The API will be available at `http://localhost:3000`
Swagger documentation will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

- `POST /auth/login` - User login

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/tasks` - Get all tasks assigned to a user

### Tasks

- `GET /tasks` - Get all tasks (with pagination and filtering)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/assign` - Assign task to a user

## Data Models

### User
```typescript
{
  id: string, // UUID
  name: string,
  email: string,
  phoneNumber: string,
  address: {
    addressLine1: string,
    addressLine2?: string,
    city: string,
    stateOrProvince: string,
    postalCode: string,
    country: string
  },
  role: string, // "admin" or "user"
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Task
```typescript
{
  id: string, // UUID
  title: string,
  description: string,
  status: string, // "pending", "in_progress", "completed"
  priority: string, // "low", "medium", "high"
  dueDate: timestamp,
  assignedTo: string, // User ID (nullable)
  createdBy: string, // User ID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Usage Examples

### 1. Create a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \

  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "address": {
      "addressLine1": "123 Main St",
      "city": "New York",
      "stateOrProvince": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create a Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete API Documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high",
    "dueDate": "2024-01-15T00:00:00.000Z"
  }'
```

### 4. Get Tasks with Filtering
```bash
curl -X GET "http://localhost:3000/tasks?status=pending&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Assign Task to User
```bash
curl -X POST http://localhost:3000/tasks/TASK_ID/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "USER_ID"
  }'
```

## Testing

Run the test suite:
```bash
# Unit tests
yarn test

# Unit tests with coverage
yarn test:cov

# E2E tests
yarn test:e2e

# Test in watch mode
yarn test:watch
```

## Database Migrations

```bash
# Generate migration
yarn migration:generate

# Run migrations
yarn migration:run

# Revert last migration
yarn migration:revert
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_USERNAME` | Database username | root |
| `DB_PASSWORD` | Database password | password |
| `DB_DATABASE` | Database name | task_management |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |


## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS enabled
- Environment variable configuration

## API Documentation

Interactive API documentation is available at `http://localhost:3000/api` when the application is running. The documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses


## License

This project is licensed under the MIT License.
