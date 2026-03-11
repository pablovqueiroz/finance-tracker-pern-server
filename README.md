# Finance Tracker PERN Server

## Project Description

Finance Tracker PERN Server is the backend API for a collaborative personal finance application. It provides authentication, account and member management, transaction tracking, saving goals, invitations, and audit logs for a PostgreSQL-based finance platform.

## Live Demo

A live version of the project can be accessed here: [Live Demo](LIVE_DEMO_LINK_HERE)

## Features

- Email/password authentication with JWT
- Google OAuth sign-in support
- User profile management with optional avatar upload
- Multi-account finance management
- Account member roles and access control
- Transaction management for income and expenses
- Saving goals and balance movement flows
- Invitation workflow for account collaboration
- Audit logs for key account actions
- Security middleware with Helmet, CORS, and rate limiting

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

## Installation

1. Clone the repository:

```bash
git clone https://github.com/pablovqueiroz/finance-tracker-pern-server.git
cd finance-tracker-pern-server
```

2. Create your environment file:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Update the `.env` file with your local configuration.

4. Install dependencies:

```bash
npm install
```

## Environment Variables

The project uses environment variables for database access, authentication, CORS, and optional integrations. Start from `.env.example` and provide values for the variables below.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `TOKEN_SECRET` | Yes | Secret used to sign JWT tokens |
| `ORIGIN` | Yes | Frontend URL allowed by CORS. Comma-separated values are supported |
| `GOOGLE_CLIENT_ID` | No | Required only if Google login is enabled |
| `CLOUDINARY_CLOUD_NAME` | No | Required only if avatar upload is enabled |
| `CLOUDINARY_API_KEY` | No | Required only if avatar upload is enabled |
| `CLOUDINARY_API_SECRET` | No | Required only if avatar upload is enabled |
| `PORT` | No | Server port. Defaults to `5000` locally |
| `NODE_ENV` | No | Runtime environment. Defaults to `development` |

Do not commit `.env` files or real credentials to version control.

## Running the Project

Run Prisma migrations in development:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Start the production build locally:

```bash
npm start
```

Run tests:

```bash
npm run test
```

## Deployment

This project is prepared for deployment as a Render Web Service.

Recommended Render configuration:

- Build Command: `npm install`
- Start Command: `npm start`

Deployment notes:

- Render provides the `PORT` variable automatically.
- `npm start` runs `prisma migrate deploy` before starting the server.
- Set `DATABASE_URL` to your remote PostgreSQL instance.
- Set `ORIGIN` to the deployed frontend URL so browser requests are accepted by CORS.
- Add `GOOGLE_CLIENT_ID` and Cloudinary variables only if those features are enabled in production.

## Project Structure

```txt
src/
  controller/    # Route handlers
  middlewares/   # Authentication, authorization, uploads, errors
  routes/        # API route definitions
  services/      # Business and integration services
  tests/         # Automated tests
  types/         # Shared TypeScript types
  utils/         # Utility helpers and env bootstrap
  app.ts         # Express app configuration
  server.ts      # Server startup entry point
prisma/
  migrations/    # Database migrations
  schema.prisma  # Prisma schema
config/          # Application and service configuration
lib/             # Prisma client setup
```

## Future Improvements

- Expand automated test coverage across business-critical routes
- Add API documentation with OpenAPI or Swagger
- Introduce CI/CD checks for build, test, and deployment validation
- Add health check and monitoring endpoints for production environments
