# Budgetivo Backend

Backend API for Budgetivo, a collaborative personal finance platform built around accounts, transactions, saving goals, invitations, and audit-aware user actions.

## Related Repositories

- Frontend: [https://github.com/pablovqueiroz/finance-tracker-pern-client](https://github.com/pablovqueiroz/finance-tracker-pern-client)
- Backend: [https://github.com/pablovqueiroz/finance-tracker-pern-server](https://github.com/pablovqueiroz/finance-tracker-pern-server)
- Live demo: [https://budgetivo.vercel.app/](https://budgetivo.vercel.app/)

## Overview

This backend provides the API and business rules that power the full Budgetivo experience:

- authentication with email/password and Google OAuth
- user profile management
- collaborative accounts with roles
- transactions and summaries
- saving goals and money movement flows
- invitation lifecycle handling
- audit-oriented account operations
- avatar upload support

## Why This Project Matters

This backend highlights practical backend engineering capabilities relevant to real product development:

- designing and maintaining a typed REST API for a complete business domain
- handling authentication, permissions, and collaborative account logic
- integrating external providers such as Google OAuth and Cloudinary
- modeling financial workflows with transactions, goals, and reporting data
- using Prisma and PostgreSQL for maintainable database access
- applying production middleware for security and operational safety

## Backend Stack

### Core

- Node.js
- Express 5
- TypeScript

### Database and ORM

- PostgreSQL
- Prisma
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`

### Authentication and Security

- JWT with `jsonwebtoken`
- Google identity verification with `google-auth-library`
- password hashing with `bcrypt` and `bcryptjs`
- Helmet
- CORS
- `express-rate-limit`
- `cookie-parser`
- `dotenv`

### Uploads and Media

- Multer
- Cloudinary

### Logging and Developer Tooling

- Morgan
- TSX
- TypeScript
- Vitest
- Supertest

## Main Backend Libraries

- `express`
- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`
- `jsonwebtoken`
- `google-auth-library`
- `bcrypt`
- `bcryptjs`
- `helmet`
- `cors`
- `express-rate-limit`
- `cookie-parser`
- `dotenv`
- `multer`
- `cloudinary`
- `morgan`
- `vitest`
- `supertest`
- `tsx`

## Features

### Authentication and User Management

- email/password authentication
- Google login with ID token validation
- JWT-based protected routes
- profile retrieval and update
- avatar upload support

### Accounts and Roles

- collaborative accounts
- roles: Owner, Admin, Viewer
- account membership management
- account-scoped permissions

### Transactions and Saving Goals

- income and expense transactions
- transaction summaries and analytics
- saving goal creation and updates
- deposit and withdrawal tracking for goals
- account balance and historical reporting support

### Invitations and Auditing

- invite creation and acceptance/rejection flow
- pending, accepted, cancelled, and expired states
- audit log support for account-level changes

## Recruiter Notes

If you are reviewing this backend from a hiring perspective, it demonstrates:

- Express + TypeScript API design
- Prisma/PostgreSQL data modeling
- authentication and authorization flows
- integration with Google OAuth and Cloudinary
- API testing with Vitest and Supertest
- security-minded middleware setup with Helmet, CORS, cookies, and rate limiting

## API Base Path

All API routes are served under:

```txt
/api
```

Main route groups:

- `/api/auth`
- `/api/users`
- `/api/accounts`
- `/api/transactions`
- `/api/saving-goals`
- `/api/invites`
- `/api/accounts/:accountId/audit-logs`

## Project Structure

```txt
src/
  controller/    route handlers
  middlewares/   auth, access control, upload, and error handling
  routes/        API route definitions
  services/      integrations such as Cloudinary
  tests/         automated API tests
  types/         shared TypeScript declarations
  utils/         env loading, permissions, audit helpers, filters
  app.ts         Express app setup
  server.ts      server bootstrap
config/          middleware and service configuration
lib/             Prisma bootstrap
prisma/
  migrations/    database migrations
  schema.prisma  database schema
generated/
  prisma/        generated Prisma client output
```

## Main Libraries and Resources

- `express`
- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`
- `jsonwebtoken`
- `google-auth-library`
- `helmet`
- `cors`
- `express-rate-limit`
- `cookie-parser`
- `dotenv`
- `multer`
- `cloudinary`
- `morgan`
- `vitest`
- `supertest`
- `tsx`

## Environment Variables

Start from `.env.example` and create `.env`.

```env
NODE_ENV=development
PORT=5000
ORIGIN=http://localhost:5173
TOKEN_SECRET=your_jwt_secret
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
```

### Notes

- `DATABASE_URL` is required.
- `TOKEN_SECRET` is required.
- `ORIGIN` can contain one or more frontend origins.
- `GOOGLE_CLIENT_ID` is required when Google login is enabled.
- Cloudinary credentials are required when avatar upload is enabled.

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
npm run test
npm run test:watch
```

## Local Development

Default local API URL:

- `http://localhost:5000`

The backend is intended to work together with the frontend app available at:

- [https://budgetivo.vercel.app/](https://budgetivo.vercel.app/)

## Deployment

Suggested backend hosting:

- Render or another Node.js host with PostgreSQL access

Production checklist:

- set `DATABASE_URL`
- set a strong `TOKEN_SECRET`
- set `ORIGIN` to the deployed frontend URL
- set `GOOGLE_CLIENT_ID` if Google login is enabled
- set Cloudinary credentials if avatar upload is enabled
