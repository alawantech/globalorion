# Files to Remove for Firebase-Only Deployment

To ensure your project uses only Firebase/Firestore and is ready for deployment, you should remove or fully comment out the following files (and any imports from them):

## Old Backend/Database Files to Remove

- `lib/db/index.ts`
- `lib/db/connection.ts`
- `lib/db/production.ts`
- `lib/db/schema.ts`
- `lib/database.ts`
- Any file in `lib/db/` that references SQLite, Drizzle, Prisma, Neon, or any SQL/ORM code

## API Routes to Check and Clean

- Any API route in `app/api/` that imports from the above files or uses:
  - `getDatabase`
  - `db`
  - `verifyToken` (unless you have a Firebase-based implementation)
  - Any SQL/ORM logic

## Other Common Files to Remove or Clean

- Any file that imports from `drizzle-orm`, `better-sqlite3`, `@prisma/client`, or `@neondatabase/serverless`
- Any file that references `.db` files or SQL queries

## What to Keep

- Only keep files that use Firestore/Firebase for all data access.
- All authentication, user, and data logic should use Firebase Auth and Firestore.

---

**After removing or commenting out these files and cleaning up imports, your project will be Firebase-only and ready for deployment.**
