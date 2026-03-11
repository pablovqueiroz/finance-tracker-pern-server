import "./utils/env.js";
import app from "./app.js";
import { prisma } from "../lib/prisma.js";

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV ?? "development";

const startServer = async () => {
  try {
    await prisma.$connect();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Allowed origins: ${process.env.ORIGIN ?? "not configured"}`);
    });

    server.on("error", (error) => {
      console.error("Server failed to start:", error);
      process.exit(1);
    });

    const shutdown = async (signal: NodeJS.Signals) => {
      console.log(`${signal} received. Shutting down.`);

      server.close(async (closeError) => {
        if (closeError) {
          console.error("Error while closing the HTTP server:", closeError);
          process.exit(1);
        }

        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
};

void startServer();
