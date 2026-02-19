# Finance Tracker PERN Server

Backend API for the Finance Tracker project, built with Node.js, Express, TypeScript, and Prisma (PostgreSQL).

## Stack

- Node.js + Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (authentication)
- Cloudinary (avatar upload)
- Google OAuth (idToken flow)

## Requirements

- Node.js 20+
- PostgreSQL
- Cloudinary account (optional, if you use image upload)
- Google OAuth Client ID (for Google login)

## Installation

```bash
npm install
```

## Environment Variables

Create your `.env` from the template:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update values in `.env`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
TOKEN_SECRET="your_jwt_secret"
PORT=5005
ORIGIN="http://localhost:5173"

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

## Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

## Scripts

- `npm run dev`: run the server in development mode with watch (`tsx`)
- `npm run build`: compile TypeScript
- `npm run start`: run the compiled build (`dist/server.js`)

## Base URL

`http://localhost:5005/api`

## Authentication

Protected routes require this header:

```http
Authorization: Bearer <token>
```

## Auth Behavior (Local + Google)

- A user account is unique by email.
- Google login links `googleId` to the same existing account (by email) when applicable.
- Local login remains allowed if `password` exists, even if Google is linked.
- Accounts created only with Google (`password = null`) cannot log in with email/password.

## Routes

### Auth (`/auth`)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`

Google login body example:

```json
{
  "idToken": "<google_id_token>"
}
```

### Users (`/users`)

- `GET /users/me`
- `PUT /users/me`
- `DELETE /users/me`

### Accounts (`/accounts`)

- `GET /accounts`
- `GET /accounts/:accountId`
- `POST /accounts`
- `PUT /accounts/:accountId`
- `DELETE /accounts/:accountId`

### Account Members (`/accounts/:accountId/members`)

- `GET /`
- `PATCH /:memberId`
- `DELETE /:memberId`

### Transactions (`/transactions`)

- `POST /transactions`
- `GET /transactions/account/:accountId`
- `GET /transactions/summary/:accountId`
- `GET /transactions/analytics/:accountId`
- `GET /transactions/dashboard/:accountId`
- `GET /transactions/:id`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`

### Saving Goals (`/saving-goals`)

- `GET /saving-goals/account/:accountId`
- `GET /saving-goals/:id`
- `POST /saving-goals`
- `POST /saving-goals/:id/move-money`
- `PUT /saving-goals/:id`
- `DELETE /saving-goals/:id`

### Invites (`/invites`)

- `GET /invites/received`
- `GET /invites/sent`
- `GET /invites/expired`
- `POST /invites`
- `POST /invites/:token/accept`
- `POST /invites/:token/reject`
- `PATCH /invites/:inviteId/expire`
- `POST /invites/:inviteId`
- `PATCH /invites/:inviteId/cancel`
- `DELETE /invites/:inviteId`

#### Invite Expiration Rule

- Invites are created with a 7-day validity.
- `PENDING` invites with `expiresAt` in the past are marked as `EXPIRED`.
- Invites can also be expired manually by the user who sent them.
- Re-sending invite for the same `email + accountId` is supported when the previous invite is no longer `PENDING`.

### Audit Logs

- `GET /accounts/:accountId/audit-logs`
- `GET /accounts/:accountId/audit-logs/:id`

#### Audit Log Coverage

Audit entries are created automatically for:

- Transactions: `CREATE`, `UPDATE`, `DELETE`
- Accounts: `CREATE`, `UPDATE`, `DELETE`
- Account Members: `UPDATE` (role), `DELETE`
- Saving Goals: `CREATE`, `UPDATE`, `DELETE`
- Invites: `CREATE`, `UPDATE` (accept/reject/expire/cancel/resend)

## Security Note

- Never commit `.env` to version control.
- Commit only `.env.example` with placeholder values.
- Rotate secrets immediately if any real values were exposed.

## Folder Structure

```txt
src/
  controller/
  middlewares/
  routes/
  services/
  types/
  utils/
  app.ts
  server.ts
prisma/
  schema.prisma
  migrations/
config/
lib/
```
