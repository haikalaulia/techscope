# Prisma + Supabase + PgBouncer Setup Guide

## ✅ Problem Solved
**Error**: `prepared statement "s0" already exists (PostgresError 42P05)`

**Root Cause**: Multiple instances of `PrismaClient` being created in different files, causing connection pooling conflicts with Supabase's PgBouncer.

---

## 📁 New Project Structure

```
be/
├── src/
│   ├── lib/
│   │   └── prisma.ts              ← SINGLETON (only place to create PrismaClient)
│   ├── config/
│   │   └── database.ts            ← Connection utilities only (imports singleton)
│   ├── controllers/
│   │   ├── AuthController.ts      ← Imports from lib/prisma
│   │   └── SearchHistoryController.ts  ← Imports from lib/prisma
│   ├── services/
│   │   └── SearchGatewayService.ts    ← Imports from lib/prisma
│   └── utils/
│       └── prisma.ts              ← DEPRECATED (redirects to lib/prisma)
├── prisma/
│   ├── schema.prisma              ← No PrismaClient instantiation
│   └── client/
│       └── index.ts               ← No PrismaClient instantiation
├── .env                           ← Correct Supabase URLs
└── tsconfig.json                  ← Has @/* path alias
```

---

## 🎯 Single Source of Truth: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";

/**
 * Singleton instance of PrismaClient
 * Prevents multiple instances and prepared statement conflicts with Supabase PgBouncer
 *
 * Usage:
 * import { prisma } from "@/lib/prisma";
 * const users = await prisma.user.findMany();
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "error", "warn"],
  });

// Only cache in development to prevent hot reload issues
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Key Points**:
- ✅ Uses `globalForPrisma` to cache instance in `global` object
- ✅ Prevents multiple instances during hot reloads (nodemon)
- ✅ Environment-aware logging (less verbose in production)
- ✅ Single instantiation point for entire application

---

## ✅ Correct `.env` Format for Supabase

```dotenv
# PgBouncer URL for connection pooling (use for Prisma)
DATABASE_URL=postgresql://postgres.ktbpoiywpbgjfxrmublr:diki2w5rs9f@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Direct connection URL (use for migrations only)
DIRECT_URL=postgresql://postgres.ktbpoiywpbgjfxrmublr:diki2w5rs9f@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Environment
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h

# Other configs...
```

**Why Two URLs?**
- `DATABASE_URL` (PgBouncer, port 6543): Used by Prisma for app connections
  - Lighter weight connection pooling
  - Ideal for serverless functions
  - **Must have** `?pgbouncer=true&connection_limit=1`
  
- `DIRECT_URL` (Direct, port 5432): Used by Prisma Migrate for schema changes
  - Direct database connection
  - Required for running migrations
  - **NOT** used during normal app runtime

---

## 📖 Usage Examples

### ✅ Controllers

```typescript
// ✅ CORRECT: Import from singleton
import { prisma } from "@/lib/prisma";

class AuthController {
  async register(req: Request, res: Response) {
    // Never use: const prisma = new PrismaClient();
    
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
      },
    });
    
    res.json({ success: true, user });
  }
}

export default new AuthController();
```

### ✅ Services

```typescript
// ✅ CORRECT: Import from singleton
import { prisma } from "@/lib/prisma";

class SearchGatewayService {
  async performHybridSearch(query: string) {
    // Never use: const prisma = new PrismaClient();
    
    const results = await prisma.searchHistory.findMany({
      where: { query },
    });
    
    return results;
  }
}

export default SearchGatewayService;
```

### ✅ Database Connection (`src/config/database.ts`)

```typescript
import { configDotenv } from "dotenv";
import { prisma } from "../lib/prisma";

configDotenv();

export async function connectDB(
  retries = process.env.NODE_ENV === "production" ? 3 : 10,
  delay = process.env.NODE_ENV === "production" ? 2000 : 3000
) {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not defined.");
    process.exit(1);
  }

  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully!");
      return;
    } catch (err) {
      console.log(`⏳ Retry ${i + 1}/${retries} failed...`);

      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
```

---

## ❌ What NOT to Do

```typescript
// ❌ WRONG: Creates new instance (causes prepared statement error)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ❌ WRONG: Importing from /prisma/client
import prisma from "../../../prisma/client";

// ❌ WRONG: Multiple instances in different files
// AuthController.ts
const prisma = new PrismaClient();

// SearchGatewayService.ts
const prisma = new PrismaClient();  // ← Different instance!
```

---

## 🔄 Development Workflow with nodemon + ts-node

### `package.json` Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node --project tsconfig.json src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "prisma migrate dev",
    "migrate:prod": "prisma migrate deploy"
  }
}
```

### Why This Works

1. **Hot Reload**: nodemon restarts Node process
2. **Singleton Cache**: Prisma reuses cached instance during hot reload
3. **No Multiple Connections**: Only one `new PrismaClient()` ever created
4. **No Prepared Statement Conflict**: PgBouncer doesn't see duplicate statements

---

## 🚀 Deployment (Vercel/Production)

### Production `.env`

```dotenv
DATABASE_URL=postgresql://user:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://user:password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
NODE_ENV=production
```

### Why Singleton Works in Serverless

In Vercel serverless functions:
- Each invocation is isolated
- `global` object is reused within same instance (warm invocation)
- Singleton cache prevents reconnection

```typescript
// api/handler.ts
let dbConnected = false;

export default async (req, res) => {
  if (!dbConnected) {
    await connectDB(3, 2000);  // Only connect once per warm instance
    dbConnected = true;
  }
  return app(req, res);
};
```

---

## 🧪 Testing Singleton

```bash
# Start development server
npm run dev

# In another terminal, make requests
curl http://localhost:3000/api/users

# Watch terminal for logs - should see ONE "DB connected" message
# Even with hot reloads (save files), singleton prevents multiple connections
```

Expected output:
```
✅ Database connected successfully!
GET http://localhost:3000/api/users 200ms
# (no duplicate connection attempts)
```

---

## 📋 Checklist

- ✅ Created `src/lib/prisma.ts` with singleton pattern
- ✅ Updated `AuthController.ts` to import from `@/lib/prisma`
- ✅ Updated `SearchHistoryController.ts` to import from `@/lib/prisma`
- ✅ Updated `SearchGatewayService.ts` to import from `@/lib/prisma`
- ✅ Updated `src/config/database.ts` to import singleton (removed instantiation)
- ✅ Updated `src/utils/prisma.ts` as deprecated (redirects to lib/prisma)
- ✅ Verified `.env` has correct Supabase URLs with `?pgbouncer=true&connection_limit=1`
- ✅ `tsconfig.json` has `@/*` path alias
- ✅ No `new PrismaClient()` anywhere except `src/lib/prisma.ts`

---

## 🐛 Troubleshooting

### Error: `prepared statement "s0" already exists`
- **Cause**: Multiple PrismaClient instances
- **Fix**: Ensure ALL imports use `import { prisma } from "@/lib/prisma"`
- **Verify**: Search codebase for `new PrismaClient()` - should only exist in `src/lib/prisma.ts`

### Error: `DATABASE_URL not found`
- **Cause**: Missing `.env` file
- **Fix**: Create `.env` with correct Supabase URLs

### Error: Connection timeout in development
- **Cause**: DATABASE_URL using direct URL (port 5432) instead of PgBouncer
- **Fix**: Use port 6543 with `?pgbouncer=true` in DATABASE_URL

### Hot reload creates multiple connections
- **Cause**: Singleton not properly cached
- **Fix**: Verify `globalForPrisma.prisma = prisma` is set in development

---

## 📚 References

- [Prisma Singleton Pattern](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-instantiation-type-error)
- [Supabase PgBouncer](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling-with-supabase)
- [Prisma with PgBouncer](https://www.prisma.io/docs/guides/database/using-prisma-with-supabase#supabase-connection-pooler)
