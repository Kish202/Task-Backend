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
   git clone <repository-url>
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

## 🚀 Deployment

### Using Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:5
    container_name: task-manager-db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    container_name: task-manager-backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/taskmanager?authSource=admin
      - JWT_SECRET=your-super-secret-jwt-key
      - JWT_REFRESH_SECRET=your-super-secret-refresh-key
    depends_on:
      - mongodb
    volumes:
      - ./src:/app/src
    command: npm run dev

volumes:
  mongodb_data:
```

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment | development | No |
| `PORT` | Server port | 5000 | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `JWT_EXPIRES_IN` | Access token expiry | 1h | No |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | Yes |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d | No |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:5173 | No |

## 📈 Performance Monitoring

### Key Metrics to Monitor
- **Response Times**: API endpoint performance
- **Error Rates**: 4xx and 5xx response counts
- **Database Performance**: Query execution times
- **Memory Usage**: Node.js heap usage
- **Authentication Success Rate**: Login/register success rates

### Recommended Tools
- **Application Monitoring**: New Relic, DataDog, or Prometheus
- **Database Monitoring**: MongoDB Atlas monitoring or Ops Manager
- **Logging**: Winston with structured logging
- **Error Tracking**: Sentry or Bugsnag

## 🔍 API Testing with Postman/Thunder Client

### Demo Credentials
After seeding the database, you can use:

**Admin User:**
- Email: admin@example.com
- Password: admin123

**Member User:**
- Email: member@example.com
- Password: member123

### Sample API Calls

**Register User:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Create Task:**
```bash
POST /api/tasks
Content-Type: application/json
Cookie: accessToken=<token>

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.999Z",
  "tags": ["documentation", "api"]
}
```

**Get Tasks with Filters:**
```bash
GET /api/tasks?status=todo&priority=high&search=project&page=1&limit=5
Cookie: accessToken=<token>
```

## 🧪 Testing Strategy

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage for utilities and helpers
- **Integration Tests**: All API endpoints
- **Authentication Tests**: Login, register, middleware
- **Authorization Tests**: Role-based access control

### Test Data Management
```javascript
// Test helper for creating users
const createTestUser = async (role = 'member') => {
  return await User.create({
    name: `Test ${role}`,
    email: `${role}@test.com`,
    password: 'password123',
    role
  });
};

// Test helper for authentication
const loginUser = async (app, email, password) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  return response.headers['set-cookie'];
};
```

## 📚 Additional Resources

### MongoDB Optimization
- Use compound indexes for complex queries
- Consider read replicas for scaling
- Implement proper connection pooling

### Security Hardening
- Implement request validation middleware
- Add API versioning strategy
- Set up proper logging and monitoring
- Consider implementing API rate limiting per user

### Scalability Considerations
- Database sharding strategy
- Caching layer (Redis) for frequent queries
- Load balancing for multiple instances
- Background job processing (Bull/Agenda)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

---

**Note**: This backend is designed to work with the React frontend using Vite and Ant Design. Make sure to configure CORS properly for your frontend domain.

For production deployment, ensure you:
- Use strong JWT secrets
- Enable HTTPS
- Set up proper monitoring
- Configure backup strategies
- Implement proper logging
- Set up CI/CD pipeline
