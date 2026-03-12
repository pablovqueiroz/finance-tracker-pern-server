# Finance Tracker Server

Express + TypeScript backend for the Finance Tracker PERN application.

## Overview

This API handles authentication, user profiles, collaborative accounts, transactions, saving goals, invitations, audit logs, and media upload support for the finance tracker platform.

## Live Demo

A live version of the API will be available here soon:

- `SERVER_LIVE_DEMO_URL`

## Tech Stack

- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Cloudinary
- Vitest
- Supertest

## Features

- JWT authentication for email/password login
- Google OAuth login using an ID token flow
- User profile endpoints with optional avatar upload
- Multi-account architecture with owner, admin, and member roles
- Transactions for income and expense tracking
- Saving goals with deposit and withdrawal flows
- Account invitations with pending, accepted, expired, and cancelled states
- Audit logs for account-level changes
- Security middleware with Helmet, CORS, rate limiting, and cookie parsing

## API Base Path

All routes are served under:

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
  middlewares/   auth, account access, upload, and error handling
  routes/        API route definitions
  services/      external integrations such as Cloudinary
  tests/         automated tests
  types/         shared TypeScript declarations
  utils/         env loading, permissions, audit helpers, filters
  app.ts         Express app setup
  server.ts      server bootstrap
config/          middleware and service configuration
lib/             Prisma client bootstrap
prisma/
  migrations/    database migrations
  schema.prisma  database schema
generated/
  prisma/        generated Prisma client output
```

## Data Model Highlights

The database schema includes:

- Users with local or Google authentication
- Accounts with per-user roles
- Transactions with typed categories
- Saving goals linked to accounts
- Account invitations
- Audit logs

Supported account currencies:

- `EUR`
- `USD`
- `BRL`
- `GBP`
- `JPY`

## Prerequisites

- Node.js `^20.19 || ^22.12 || ^24.0`
- npm
- PostgreSQL

## Installation

```bash
npm install
```

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

Variable notes:

- `DATABASE_URL` is required.
- `TOKEN_SECRET` is required.
- `ORIGIN` accepts comma-separated frontend origins.
- `GOOGLE_CLIENT_ID` is required only if Google login is enabled.
- Cloudinary variables are required only if avatar upload is used.
- In development, if `ORIGIN` is omitted, the server falls back to `http://localhost:5173`.

## Database Setup

Generate the Prisma client and apply local migrations:

```bash
npx prisma migrate dev
```

If you only need to regenerate the client:

```bash
npx prisma generate
```

## Available Scripts

```bash
npm run dev
npm run build
npm start
npm run test
npm run test:watch
```

## Local Development

Start the API in watch mode:

```bash
npm run dev
```

Default local port:

- `http://localhost:5000`

The server logs the active environment and allowed origins on startup.

## Production

Build the project:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

`npm start` runs `prisma migrate deploy` before launching `dist/src/server.js`.

## Testing

Run the test suite:

```bash
npm run test
```

Current automated coverage includes API authentication tests under `src/tests`.

## Deployment Notes

The server is structured for platforms such as Render or any Node.js host with PostgreSQL access.

Production checklist:

- Set `DATABASE_URL` to the production database.
- Set `TOKEN_SECRET` to a strong secret.
- Set `ORIGIN` to the deployed frontend URL.
- Provide `GOOGLE_CLIENT_ID` if Google login is enabled.
- Provide Cloudinary credentials if avatar upload is enabled.
