# TechScope Search Engine - API Documentation

## Daftar Isi

1. [Database Schema](#database-schema)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [Conditional Logging Logic](#conditional-logging-logic)
5. [Setup & Deployment](#setup--deployment)

---

## Database Schema

### Model User

Menyimpan informasi pengguna dan kredensial untuk autentikasi JWT/OTP.

```prisma
model User {
  id              String          @id @default(uuid())
  email           String          @unique
  fullName        String
  password        String
  token           String?
  role            String          @default("user")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  otp             String?
  expOtp          DateTime?
  isVerify        Boolean         @default(false)
  photoUrl        String?

  // Relations
  searchHistories SearchHistory[]

  @@map("User")
}
```

**Fields:**

- `id` - UUID primary key
- `email` - Email unik untuk login
- `fullName` - Nama lengkap user
- `password` - Hashed password menggunakan bcryptjs
- `token` - JWT token untuk autentikasi
- `role` - Role user (admin, user, etc)
- `otp` - One-Time Password untuk verifikasi email
- `expOtp` - Waktu expire OTP
- `isVerify` - Status verifikasi email
- `photoUrl` - URL foto profil
- `searchHistories` - Relasi ke SearchHistory (1:N)

### Model SearchHistory (BARU)

Menyimpan riwayat pencarian pengguna yang sudah authenticated.

```prisma
model SearchHistory {
  id              String          @id @default(uuid())
  userId          String
  query           String
  processedQuery  String
  resultsJson     Json
  createdAt       DateTime        @default(now())

  // Relations
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Indexes
  @@index([userId])
  @@index([createdAt])
  @@map("SearchHistory")
}
```

**Fields:**

- `id` - UUID primary key
- `userId` - Foreign key ke User.id (Cascade delete)
- `query` - Query mentah dari user (e.g., "iphone 14 pro")
- `processedQuery` - Query setelah preprocessing NLP (e.g., "iphone pro")
- `resultsJson` - JSON object berisi hasil dari Flask API
- `createdAt` - Timestamp otomatis saat record dibuat

**Indexes:**

- `userId` - Untuk mempercepat query BY user
- `createdAt` - Untuk sorting chronological

---

## Authentication Flow

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │ 1. Login dengan email & password
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     │
┌──────────────────────────────────────┐    │
│ POST /api/auth/login                 │    │
│ {email, password}                    │    │
└──────────────────────────────────────┘    │
       │                                     │
       │ 2. Server validate password         │
       │    Generate JWT token              │
       │                                     │
       ▼                                     │
┌──────────────────────────────────────┐    │
│ {token, user}                        │◄───┘
└──────────────────────────────────────┘
       │
       │ 3. Client menyimpan token di localStorage/cookies
       │
       ▼ 4. Client kirim request dengan token
┌──────────────────────────────────────┐
│ GET /api/search?query=iphone         │
│ Headers: Authorization: Bearer TOKEN │
└──────────────────────────────────────┘
       │
       │ 5. Middleware verifyToken() check token
       │
       ▼ Jika valid, extract user info
┌──────────────────────────────────────┐
│ req.user = {id, email, role, ...}    │
└──────────────────────────────────────┘
```

---

## API Endpoints

### 🔐 Authentication Required: Conditional (User dapat search tanpa login)

### 1. POST /api/search - Hybrid Search

**Description**: Melakukan hybrid search NLP dengan conditional logging

**Access**:

- ✅ Authenticated Users
- ✅ Unauthenticated Users (Guest)

**Request**:

```json
{
  "query": "iphone 14 pro",
  "limit": 10,
  "offset": 0
}
```

**Request Headers**:

```
Authorization: Bearer <token>  // Optional, jika ada token = authenticated
Content-Type: application/json
```

**Response (Success - Authenticated)**:

```json
{
  "success": true,
  "data": {
    "query": "iphone 14 pro",
    "processedQuery": "iphone pro",
    "results": [
      {
        "id": "device_1",
        "name": "iPhone 14 Pro",
        "price": 1499,
        "similarity": 0.95
      }
    ],
    "metadata": {
      "executionTime": 250,
      "totalResults": 45
    }
  },
  "historyId": "hist_abc123",
  "message": "Search completed and saved to history"
}
```

**Response (Success - Guest)**:

```json
{
  "success": true,
  "data": {
    "query": "iphone 14 pro",
    "processedQuery": "iphone pro",
    "results": [...],
    "metadata": {...}
  },
  "historyId": null,
  "message": "Search completed (not saved - unauthenticated user)"
}
```

**Response (Error)**:

```json
{
  "success": false,
  "message": "Error connecting to search service",
  "error": "Connection refused"
}
```

---

### 2. GET /api/search/history/:userId - Get Search History

**Description**: Mengambil riwayat pencarian user

**Access**: 🔒 Authentication Required (Only own user)

**Request**:

```
GET /api/search/history/user_12345?limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters**:

- `limit` (number, default: 20) - Jumlah record per page
- `offset` (number, default: 0) - Starting position (pagination)

**Response (Success)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "hist_1",
      "userId": "user_12345",
      "query": "iphone 14",
      "processedQuery": "iphone",
      "resultsJson": {...},
      "createdAt": "2025-11-29T10:30:00Z"
    },
    {
      "id": "hist_2",
      "userId": "user_12345",
      "query": "samsung s23",
      "processedQuery": "samsung",
      "resultsJson": {...},
      "createdAt": "2025-11-29T10:25:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Response (Error - Unauthorized)**:

```json
{
  "success": false,
  "message": "Unauthorized to view this user's history"
}
```

---

### 3. DELETE /api/search-history/:historyId - Delete Single History

**Description**: Menghapus satu riwayat pencarian

**Access**: 🔒 Authentication Required (Only own history)

**Request**:

```json
DELETE /api/search-history/hist_abc123
Authorization: Bearer <token>

Body:
{
  "userId": "user_12345"
}
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "Search history deleted successfully"
}
```

---

### 4. DELETE /api/search-history/clear/:userId - Clear All History

**Description**: Menghapus semua riwayat pencarian user

**Access**: 🔒 Authentication Required (Only own user)

**Request**:

```json
DELETE /api/search-history/clear/user_12345
Authorization: Bearer <token>

Body:
{
  "userId": "user_12345"
}
```

**Response (Success)**:

```json
{
  "success": true,
  "message": "All search histories cleared successfully",
  "data": {
    "deletedCount": 45
  }
}
```

---

## Conditional Logging Logic

### Alur Eksekusi Gateway Service:

```
USER REQUEST
    ↓
┌─────────────────────────────────────────┐
│ POST /api/search with/without token     │
└──────────────────┬──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │ Extract token info   │
        │ isAuthenticated?     │
        └──────────┬───────────┘
                   ↓
    ┌──────────────────────────────────┐
    │  Call Flask API                  │
    │  GET /api/search?query=...       │
    │  Returns: {query, processedQuery,│
    │            results, metadata}    │
    └──────────────┬───────────────────┘
                   ↓
        ┌──────────────────────┐
        │ Check: Authenticated?│
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
      YES                     NO
        │                     │
        ▼                     ▼
    ┌───────────────┐  ┌────────────────┐
    │ Save to       │  │ Don't save     │
    │ SearchHistory │  │ Return results │
    │ database      │  │ only           │
    └───────┬───────┘  └────────────────┘
            │                 │
            └────────┬────────┘
                     ▼
         ┌─────────────────────────┐
         │ Return success response │
         │ + optional historyId    │
         └─────────────────────────┘
                     ↓
                USER GETS RESPONSE
```

### Keuntungan Conditional Logging:

1. **Transparansi**: Guest users tahu search mereka tidak disimpan
2. **Privacy**: No tracking untuk unauthenticated users
3. **Performance**: Guest searches tidak menambah DB load
4. **Analytics**: Hanya authenticated users yang ditrack
5. **Compliance**: GDPR friendly - optional tracking

---

## Setup & Deployment

### 1. Prerequisites

- Node.js v20.19+
- PostgreSQL database (Supabase recommended)
- Python Flask API running on port 5001

### 2. Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DIRECT_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your_super_secret_key

# Flask API
FLASK_API_URL=http://localhost:5001

# Server
PORT=5000

# Cloudinary (untuk upload)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
SMTP_SECURE=true
```

### 3. Database Migration

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Apply migrations (kalau DB online)
npx prisma migrate dev --name add_search_history_model

# Or push schema langsung
npx prisma db push
```

### 4. Running Development

```bash
npm run dev
# Server running on http://localhost:5000
```

### 5. Build Production

```bash
npm run build
npm start
```

---

## API Request Examples

### cURL Examples:

**1. Guest Search**:

```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iphone 14"}'
```

**2. Authenticated Search** (dengan token):

```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"query": "iphone 14"}'
```

**3. Get Search History**:

```bash
curl -X GET http://localhost:5000/api/search/history/user_123 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

**4. Delete Search History**:

```bash
curl -X DELETE http://localhost:5000/api/search-history/hist_abc123 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123"}'
```

---

## Error Codes

| Status | Message                | Cause                                    |
| ------ | ---------------------- | ---------------------------------------- |
| 400    | Query is required      | Empty atau missing query                 |
| 401    | No token provided      | Request memerlukan auth                  |
| 403    | Unauthorized           | User tidak punya akses ke resource       |
| 404    | User/History not found | Data tidak ada di DB                     |
| 500    | Internal server error  | Server error atau Flask connection error |

---

## Migration History

### Migration 1: User Table (20251030165634_init)

- Create User table dengan fields dasar

### Migration 2: Update User (20251030180053_users)

- Add fields: otp, expOtp, isVerify, photoUrl

### Migration 3: SearchHistory Table (20251129_add_search_history)

- Create SearchHistory table
- Add Foreign Key constraint ke User
- Add indexes untuk userId & createdAt

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                     │
│              (Browse products, login, etc)               │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Gateway Service (Node.js)                   │
│              Port 5000 - /api/*                          │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Routes:                                            │ │
│  │ • POST /api/search           [Gateway Logic]       │ │
│  │ • GET  /api/search/history   [User Only]           │ │
│  │ • POST /api/auth/login       [Auth]                │ │
│  │ • POST /api/auth/register    [Auth]                │ │
│  └────────────────────────────────────────────────────┘ │
└────────┬──────────────────────────────────────┬─────────┘
         │                                      │
         │ HTTP                                 │ PRISMA ORM
         ▼                                      ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  Search Service          │      │  PostgreSQL Database     │
│  (Flask/Python)          │      │  (Supabase)              │
│  Port 5001 - /api/*      │      │                          │
│                          │      │ Tables:                  │
│ Hybrid Search NLP        │      │ • User                   │
│ • Jaccard Similarity     │      │ • SearchHistory          │
│ • Vector Search          │      │                          │
│ • Device Matching        │      │                          │
│                          │      │                          │
└──────────────────────────┘      └──────────────────────────┘
```

---

## File Structure

```
be/
├── prisma/
│   ├── schema.prisma                    ← Database schema
│   ├── client/
│   │   └── index.ts
│   └── migrations/                      ← Database migrations
│       ├── 20251030165634_init/
│       ├── 20251030180053_users/
│       └── 20251129_add_search_history/
│
├── src/
│   ├── controllers/
│   │   ├── AuthController.ts            ← Authentication logic
│   │   ├── SearchController.ts          ← Search endpoint logic
│   │   └── SearchHistoryController.ts   ← History CRUD operations
│   │
│   ├── services/
│   │   └── SearchGatewayService.ts      ← Proxy to Flask + conditional logging
│   │
│   ├── routes/
│   │   ├── AuthRouter.ts                ← Auth routes
│   │   ├── SearchRouter.ts              ← Search routes (gateway)
│   │   └── SearchHistoryRouter.ts       ← History routes
│   │
│   ├── middleware/
│   │   └── auth.ts                      ← JWT verification middleware
│   │
│   ├── types/
│   │   ├── auth.types.ts                ← Auth related types
│   │   └── searchHistory.types.ts       ← SearchHistory types
│   │
│   ├── config/
│   │   ├── database.ts                  ← Prisma Client setup
│   │   └── env.config.ts
│   │
│   ├── app.ts                           ← Express app setup
│   └── server.ts                        ← Server entry point
│
├── package.json
├── tsconfig.json
├── .env                                 ← Environment variables
└── dist/                                ← Compiled JavaScript (after build)
```

---

**Created**: 2025-11-29  
**Last Updated**: 2025-11-29  
**Version**: 1.0.0
