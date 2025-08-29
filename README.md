# Task Manager Backend API

A robust REST API for task management with role-based authentication and comprehensive features.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Task Management**: Full CRUD operations with advanced filtering and search
- **User Management**: Admin panel for user role management
- **Activity Logging**: Track all task operations with detailed logs
- **Statistics**: Comprehensive dashboard statistics
- **Security**: Password hashing, input validation, rate limiting
- **Testing**: Comprehensive test suite with Jest and Supertest

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Joi** - Input validation
- **Jest** - Testing framework

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database and JWT configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Authentication, validation, etc.
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── utils/           # Helper functions
├── tests/               # Test files
└── package.json
```

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kish202/Task-Backend.git
    
     cd task-manager-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Tasks
- `GET /api/tasks` - Get tasks with filtering, search, and pagination
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users (Admin only)
- `GET /api/users` - Get all users
- `PATCH /api/users/:id/role` - Update user role

### Statistics
- `GET /api/stats/overview` - Get dashboard statistics

## 🔍 Query Parameters

### Task Filtering
```
GET /api/tasks?status=todo&priority=high&search=project&page=1&limit=10
```

Available filters:
- `status`: todo, in-progress, done
- `priority`: low, medium, high
- `assignee`: user ID
- `dueDateFrom`: ISO date string
- `dueDateTo`: ISO date string
- `search`: search in title, description, tags
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: field:order (e.g., `createdAt:desc`, `dueDate:asc`)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci

# Run specific test file
npm test auth.test.js
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT tokens stored in HTTP-only cookies
- Input validation with Joi
- Rate limiting on authentication endpoints
- CORS configuration
- Helmet for security headers
- Role-based access control

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'member',
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  title: String,
  description: String,
  status: 'todo' | 'in-progress' | 'done',
  priority: 'low' | 'medium' | 'high',
  dueDate: Date,
  tags: [String],
  assignee: ObjectId (User),
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Log
```javascript
{
  taskId: ObjectId (Task),
  userId: ObjectId (User),
  action: 'create' | 'update' | 'delete',
  changes: Object,
  timestamp: Date
}
```

## 🎯 Trade-offs & Decisions

### Authentication Strategy
- **HTTP-only cookies vs localStorage**: Chose HTTP-only cookies for better XSS protection
- **JWT expiration**: Short-lived access tokens (1h) with longer refresh tokens (7d)
- **Password complexity**: Minimum 6 characters (can be enhanced based on requirements)

### Database Design
- **MongoDB over SQL**: Better flexibility for evolving task schema and faster development
- **Embedded vs Referenced data**: Used references for users but could embed for better read performance
- **Indexing strategy**: Focused on common query patterns (user, status, dates)

### Performance Considerations
- **Pagination**: Implemented cursor-based pagination for better performance at scale
- **Query optimization**: Added appropriate indexes and query filtering
- **Activity logging**: Asynchronous logging to avoid blocking main operations

### Security Trade-offs
- **Rate limiting**: Conservative limits that may need adjustment based on usage patterns
- **CORS**: Configured for specific origins but may need refinement for production
- **Error messages**: Balance between helpful debugging and security (information disclosure)

### Code Architecture
- **Middleware separation**: Clear separation of concerns for auth, validation, error handling
- **Controller patterns**: Consistent error handling and response formats
- **Testing strategy**: Focus on integration tests over unit tests for faster development


