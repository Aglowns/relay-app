# Relay Backend API

Backend API for Relay iOS app - AI-powered message suggestions with subscription management.

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **LLM**: OpenAI (GPT-4o-mini, ready for GPT-5)
- **Hosting**: Render
- **Auth**: JWT with access/refresh tokens
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- OpenAI API key

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# JWT Authentication
JWT_SECRET="change-this-to-a-random-secret-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="90d"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key-here"
OPENAI_MODEL="gpt-4o-mini"

# Application
NODE_ENV="development"
PORT=3000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Subscription Limits
FREE_PLAN_DAILY_LIMIT=100
PRO_PLAN_DAILY_LIMIT=10000

# Stripe (for future integration)
STRIPE_WEBHOOK_SECRET=""
```

### 3. Supabase Connection

#### Getting Your Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Copy the **Connection string** (URI format)
4. Replace `[YOUR-PASSWORD]` with your database password
5. Replace `[PROJECT-REF]` with your project reference

#### Connection Pooling

For production, use Supabase's connection pooling:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
```

**Note**: Use the direct connection (without `?pgbouncer=true`) for migrations, and the pooled connection for the application in production.

### 4. Database Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

This will create all necessary tables and indexes.

### 5. Start the Server

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication testing

### Health Check

Check API health status:

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

### Request ID Tracking

All API responses include an `X-Request-ID` header for request tracking. You can also include this header in your requests:

```
X-Request-ID: your-custom-request-id
```

## API Endpoints

### Authentication

#### Register
```
POST /v1/auth/register
```

Body:
```json
{
  "email": "user@example.com",
  "password": "SuperSecret123",
  "device": {
    "device_id": "550e8400-e29b-41d4-a716-446655440000",
    "platform": "ios",
    "model": "iPhone 15",
    "os_version": "18.0"
  }
}
```

#### Login
```
POST /v1/auth/login
```

#### Refresh Token
```
POST /v1/auth/refresh
```

Body:
```json
{
  "refresh_token": "your-refresh-token"
}
```

#### Logout
```
POST /v1/auth/logout
```

### User Management

#### Get Profile
```
GET /v1/me
Authorization: Bearer <access_token>
```

### Style Settings

#### Get Style Settings
```
GET /v1/me/style
Authorization: Bearer <access_token>
```

#### Update Style Settings
```
PUT /v1/me/style
Authorization: Bearer <access_token>
```

Body:
```json
{
  "tone": "neutral",
  "emoji_level": "low",
  "length_pref": "medium",
  "profanity_ok": false
}
```

### Devices

#### Register Device
```
POST /v1/devices/register
Authorization: Bearer <access_token>
```

#### List Devices
```
GET /v1/devices
Authorization: Bearer <access_token>
```

### Message Generation

#### Generate Suggestions
```
POST /v1/messages/generate
Authorization: Bearer <access_token>
```

Body:
```json
{
  "incoming_messages": [
    {
      "from_me": false,
      "text": "Hey, can you send over the report by today?",
      "timestamp": "2025-11-25T16:30:00Z"
    }
  ],
  "style_override": {
    "tone": "formal",
    "length_pref": "short"
  },
  "n_suggestions": 3
}
```

**Input Limits**:
- Max 2000 characters per message
- Max 5000 characters total context
- Max 20 incoming messages
- 1-4 suggestions per request

## Subscription System

### Trial Period

- New users automatically get a 3-day trial
- Trial starts on registration
- Daily limit: 100 requests during trial

### Subscription Plans

- **Free/Trial**: 100 requests per day
- **Pro**: 10,000 requests per day

### Subscription Expiration

The system automatically checks and updates expired subscriptions:
- Trials expire after 3 days
- Monthly subscriptions expire after 30 days
- Yearly subscriptions expire after 365 days

## Database Migrations

### Local Development

Run migrations:

```bash
npm run prisma:migrate
```

This will:
1. Create a new migration file
2. Apply the migration to your database
3. Regenerate Prisma Client

### Production (Render)

1. **Option 1: Via Render Dashboard**
   - Add environment variable: `DATABASE_URL`
   - In build command, add: `npm run prisma:generate && npm run prisma:migrate deploy`
   - Or run migrations manually via Render shell

2. **Option 2: Manual Migration**
   ```bash
   # Connect to Render shell
   npm run prisma:migrate deploy
   ```

### Rollback

To rollback a migration:

```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

## Deployment to Render

### 1. Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the `backend` directory

### 2. Configure Build Settings

**Build Command**:
```bash
npm install && npm run build
```

**Start Command**:
```bash
npm run start:prod
```

### 3. Environment Variables

Add all environment variables from your `.env` file in the Render dashboard:

- `DATABASE_URL` (Supabase connection string)
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NODE_ENV=production`
- `PORT` (Render sets this automatically)
- `THROTTLE_TTL`
- `THROTTLE_LIMIT`
- `FREE_PLAN_DAILY_LIMIT`
- `PRO_PLAN_DAILY_LIMIT`

### 4. Health Check

Configure health check in Render:
- **Health Check Path**: `/health`
- **Health Check Interval**: 60 seconds

### 5. Database Migrations on Render

Before deploying, run migrations:

1. Use Render Shell to connect
2. Run: `npm run prisma:migrate deploy`

Or add to build command:
```bash
npm install && npm run prisma:generate && npm run prisma:migrate deploy && npm run build
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Short-lived access tokens (15min) and long-lived refresh tokens (90 days)
- **Token Hashing**: Refresh tokens are hashed before storage
- **Input Validation**: All DTOs validated with class-validator
- **Rate Limiting**: Per-IP and per-user rate limiting
- **Input Sanitization**: Strings trimmed, control characters removed
- **XSS Prevention**: Input sanitization in stored data
- **SQL Injection Prevention**: Prisma ORM handles parameterized queries

## Logging

The API includes comprehensive logging:

- **Request Logging**: All incoming requests logged with method, path, and sanitized body
- **Response Logging**: Response times and status codes
- **Error Logging**: Detailed error information (without sensitive data)
- **Sensitive Data**: Passwords, tokens, and other sensitive fields are redacted in logs

## Development

### Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts          # Root module
│   ├── common/                 # Shared modules
│   │   ├── prisma/            # Database service
│   │   ├── filters/           # Exception filters
│   │   └── interceptors/     # Request/response interceptors
│   ├── health/                # Health check endpoint
│   ├── auth/                  # Authentication module
│   ├── users/                 # User management
│   ├── devices/               # Device management
│   ├── messages/              # Message generation
│   ├── style/                 # Style settings
│   ├── subscriptions/         # Subscription management
│   └── webhooks/              # Webhook endpoints
├── prisma/
│   └── schema.prisma          # Database schema
└── package.json
```

### Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Ensure IP is whitelisted (if required)
4. Try connection pooling URL for production

### Migration Issues

1. Ensure Prisma Client is generated: `npm run prisma:generate`
2. Check database connection
3. Verify migration files are in `prisma/migrations/`

### OpenAI API Issues

1. Verify `OPENAI_API_KEY` is set correctly
2. Check API key has sufficient credits
3. Verify model name is correct (e.g., `gpt-4o-mini`)

## Future Enhancements

- Stripe payment integration
- Admin dashboard endpoints
- Analytics and usage insights
- Message caching for similar requests
- Redis for advanced rate limiting
- Background job processing

## License

MIT

