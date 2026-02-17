# IQnite Platform - Backend API

Enterprise-grade backend built with **NestJS**, **Prisma**, **PostgreSQL**, and **JWT Authentication**.

## 🚀 Tech Stack

- **Framework**: NestJS (Node.js framework with TypeScript)
- **ORM**: Prisma 7 with PostgreSQL adapter
- **Database**: PostgreSQL 17
- **Authentication**: JWT + Passport.js
- **Validation**: class-validator & class-transformer
- **Caching**: Redis (planned)
- **Rate Limiting**: @nestjs/throttler

## 📋 Prerequisites

✅ **Installed:**
- ✅ Node.js v22.16.0
- ✅ npm v11.4.2
- ✅ PostgreSQL 17
- ✅ NestJS CLI

## 🗄️ Database Setup

**Database Created:**
- **Name**: `iqnite`
- **User**: `iqnite_user`
- **Password**: `iqnite_dev_2026`
- **Port**: 5432

**Connection String:**
```
postgresql://iqnite_user:iqnite_dev_2026@localhost:5432/iqnite?schema=public
```

## 📦 Installation

All dependencies are already installed:

```bash
npm install
```

## 🔧 Environment Variables

Configuration file `.env` is set up with:

```env
DATABASE_URL="postgresql://iqnite_user:iqnite_dev_2026@localhost:5432/iqnite?schema=public"
JWT_SECRET="your-super-secure-jwt-secret-change-in-production"
JWT_EXPIRATION="7d"
REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT=3000
NODE_ENV="development"
```

⚠️ **Important**: Change `JWT_SECRET` in production!

## 🗃️ Database Schema

### Models Created:

- **User** - Core user authentication
  - id, email, username, password (hashed)
  - firstName, lastName
  - role (ADMIN, USER, MODERATOR)
  - isActive, isVerified
  - verificationToken, resetPasswordToken
  - createdAt, updatedAt, lastLoginAt

- **Profile** - Extended user information
  - userId, avatar, bio, phone
  - dateOfBirth, address, city, country, zipCode

- **Session** - Active user sessions
  - userId, token, ipAddress, userAgent
  - expiresAt

- **RefreshToken** - JWT refresh tokens
  - userId, token, expiresAt

## 🏃 Running the Application

### Development Mode (with hot reload):
```bash
npm run start:dev
```

### Production Build:
```bash
npm run build
npm run start:prod
```

### Watch Mode:
```bash
npm run start
```

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

### Health Check
```
GET /api/health
```

Returns database and API status.

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "john_doe",
  "password": "SecurePass123!"
}
```

Returns:
```json
{
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User (Protected)
```http
POST /api/auth/me
Authorization: Bearer <accessToken>
```

#### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## 🔐 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number or special character

## 🛠️ Prisma Commands

### Generate Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Apply Migrations (Production)
```bash
npx prisma migrate deploy
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Auth guards
│   │   ├── strategies/       # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── prisma/               # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── health/               # Health check
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Refresh token rotation
- ✅ Session management
- ✅ Rate limiting (100 req/min)
- ✅ CORS enabled
- ✅ Input validation & sanitization
- ✅ SQL injection protection (Prisma)

## 🚧 Next Steps

### Immediate:
- [ ] Install and configure Redis for caching
- [ ] Add email verification flow
- [ ] Implement password reset functionality
- [ ] Add user profile management endpoints

### Future:
- [ ] Add role-based access control (RBAC)
- [ ] Implement file upload (avatar/documents)
- [ ] Add audit logging
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Add API documentation (Swagger)
- [ ] Implement pagination
- [ ] Add search functionality
- [ ] Set up CI/CD pipeline

## 📊 Database ER Diagram

```
User ----1----1---- Profile
 |
 +----1----*---- Session
 |
 +----1----*---- RefreshToken
```

## 🐛 Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check PostgreSQL service status
Get-Service -Name postgresql*

# Test connection
psql -U iqnite_user -d iqnite
```

### Prisma Client Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Check database connection
npx prisma db pull
```

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## 📝 Development Notes

- Server runs on `http://localhost:3000/api`
- Hot reload is enabled in dev mode
- Database migrations are auto-applied in dev mode
- All API responses use JSON format
- Timestamps are in ISO 8601 format

## 👥 API Rate Limits

- **Default**: 100 requests per minute
- Configure in `app.module.ts` via `ThrottlerModule`

## 🔄 Migration Strategy

1. Make schema changes in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Prisma generates migration SQL and updates client
4. Review migration in `prisma/migrations/`
5. Commit migration files to version control

## 📞 Support

For issues or questions, check:
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Status**: ✅ Backend is fully operational and ready for development!

**Test the API**: Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)
