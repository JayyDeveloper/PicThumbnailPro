# ThumbnailCraft - Setup Guide

## 🎯 Overview

ThumbnailCraft is a YouTube thumbnail maker application that allows users to create professional thumbnails with AI-powered image generation. New users receive **1 free token** to test the service.

## 🔒 Security Improvements Implemented

### ✅ What Was Fixed

1. **JWT Authentication** - Replaced insecure user ID tokens with proper JWT tokens
2. **Database Integration** - Added PostgreSQL support with Drizzle ORM (fallback to memory storage)
3. **Debug Endpoints Gated** - Debug endpoints now only work in development mode
4. **Stripe Webhook Handler** - Added webhook endpoint for payment verification
5. **Environment Variable Template** - Created `.env.example` for configuration

### ⚠️ Known Limitations

- **Points Added Before Payment Confirmation**: Currently points are added immediately when purchase is initiated, not after Stripe confirms payment. This is marked with warnings in the code and should be refactored for production.

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database (optional - app works without it)
- Stripe account (optional - for payments)
- OpenAI API key (optional - for DALL-E 3 image generation)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
# Required for persistent storage (optional)
DATABASE_URL=postgresql://user:password@host:port/database

# Required for secure authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Optional: Stripe for payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: OpenAI for AI image generation
OPENAI_API_KEY=sk-...

# Environment
NODE_ENV=development
```

### 3. Set Up Database (Optional)

If you want persistent storage:

#### Option A: Using Replit PostgreSQL

1. In Replit, go to **Tools** → **Secrets**
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. The app will automatically use the database

#### Option B: Push Migrations Manually

```bash
# Generate and push migrations
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5001`

## 🔑 Token/Credit System

### How It Works

1. **New User Registration**: Users automatically receive **1 FREE TOKEN**
2. **Token Usage**:
   - Save a thumbnail: **-1 token**
   - Export a thumbnail: **-1 token**
3. **Purchasing More Tokens**:
   - Basic Pack: 5 tokens for $4.99
   - Standard Pack: 15 tokens for $9.99
   - Pro Pack: 50 tokens for $19.99

### Implementation Details

- Default token allocation is defined in `shared/schema.ts:11`
  ```typescript
  points: integer("points").notNull().default(1)
  ```

- Token verification happens in `server/routes.ts` before save/export operations:
  ```typescript
  if (user.points < 1) {
    return res.status(403).json({ error: 'Insufficient points' });
  }
  ```

## 🗄️ Database Architecture

### Storage Modes

The app supports two storage modes:

#### 1. Database Storage (Production)

When `DATABASE_URL` is configured:
- ✅ Persistent data (survives restarts)
- ✅ Supports multiple instances
- ✅ Full transaction history
- ✅ Better performance at scale

#### 2. Memory Storage (Development/Fallback)

When `DATABASE_URL` is not configured:
- ⚠️ Data lost on restart
- ⚠️ Single instance only
- ✅ No setup required
- ✅ Fast for testing

The app automatically detects which storage mode to use on startup.

### Database Tables

- **users**: User accounts with points balance
- **thumbnails**: Saved thumbnail designs
- **point_transactions**: Transaction history
- **point_packages**: Available token packages
- **reference_images**: Stock and user-uploaded images
- **stock_categories**: Image category organization

## 🔐 Authentication

### JWT Token System

Tokens are signed JWTs containing:
```json
{
  "userId": 123,
  "username": "john",
  "email": "john@example.com",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "thumbnailcraft"
}
```

Tokens expire after **7 days**.

### API Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🛠️ Development

### Debug Endpoints

**Only available when `NODE_ENV !== 'production'`**

```bash
# Create/login user with custom points
POST /api/debug/login-with-points
Body: { username: "test", points: 10 }

# Check user points
GET /api/debug/points/:userId

# Set user points
POST /api/debug/set-points/:userId
Body: { points: 20 }
```

### Testing User Registration

```bash
# Register a new user (receives 1 free token)
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Response:
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "points": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 💳 Stripe Integration

### Setup Webhook

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:5001/api/stripe/webhook
   ```
3. Copy the webhook signing secret to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Webhook Events Handled

- `payment_intent.succeeded` - Confirm payment and add points
- `payment_intent.payment_failed` - Handle failed payment

## 🚨 Security Checklist for Production

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure `DATABASE_URL` (required for production)
- [ ] Set up Stripe webhook endpoint with `STRIPE_WEBHOOK_SECRET`
- [ ] Refactor point purchase to only add points after webhook confirmation
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for your frontend domain
- [ ] Add rate limiting on auth endpoints
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure CDN for uploaded images
- [ ] Set up database backups

## 📊 Monitoring Logs

The app logs important events:

```
✅ Using database storage (PostgreSQL)
✅ Database connection established
✅ Initial data seeded successfully
✅ New user registered: testuser (test@example.com) with 1 free token
✅ User logged in: testuser (1 tokens available)
⚠️  Points added before payment confirmation - INSECURE for production!
```

## 🐛 Troubleshooting

### Database Connection Issues

If you see:
```
⚠️  Database not connected. Using in-memory storage
```

**Solutions:**
1. Check `DATABASE_URL` is set correctly in environment variables
2. Verify database is running and accessible
3. Check network connectivity
4. Verify database credentials

### JWT Token Issues

If authentication fails:
- Check `JWT_SECRET` is set
- Verify token hasn't expired (7 day limit)
- Check Authorization header format: `Bearer <token>`

### Points Not Deducted

If points aren't being deducted:
- Check user has at least 1 point before operation
- Verify transaction is being created in database
- Check console logs for errors

## 📝 API Documentation

### User Endpoints

- `POST /api/auth/register` - Register new user (1 free token)
- `POST /api/auth/login` - Login user
- `GET /api/user` - Get current user info (requires auth)

### Point Endpoints

- `GET /api/point-packages` - List available token packages
- `POST /api/purchase-points` - Purchase tokens (requires auth)
- `GET /api/transactions` - Get transaction history (requires auth)

### Thumbnail Endpoints

- `POST /api/thumbnails` - Save thumbnail (-1 token, requires auth)
- `POST /api/thumbnails/export` - Export thumbnail (-1 token, requires auth)
- `GET /api/user/thumbnails` - Get user's thumbnails (requires auth)
- `GET /api/thumbnails/:id` - Get specific thumbnail

### Image Endpoints

- `POST /api/generate-image` - Generate AI image from prompt
- `POST /api/upload` - Upload custom image

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Radix UI
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Payments**: Stripe
- **Image Processing**: Sharp
- **AI**: OpenAI DALL-E 3 (optional)

## 📄 License

MIT

## 🤝 Contributing

1. Test user registration flow (1 free token)
2. Test token deduction on save/export
3. Verify JWT authentication works
4. Check debug endpoints only work in development
5. Report any issues

---

**Last Updated**: 2025-11-05
**Version**: 1.0.0
**Status**: ✅ Core functionality working, ⚠️ Payment flow needs production hardening
