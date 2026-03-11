import express from "express";
import type { Application } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { getAllowedOrigins, nodeEnv } from "../src/utils/env.js";

export default function config(app: Application): void {
  const allowedOrigins = getAllowedOrigins();

  app.set("trust proxy", 1);
  app.use(helmet());

  if (nodeEnv === "production" && allowedOrigins.length === 0) {
    console.warn(
      "CORS is running without configured browser origins. Set ORIGIN to allow frontend requests.",
    );
  }

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Try again later." },
  });

  app.use("/api/auth", authLimiter);

  app.use(logger(nodeEnv === "production" ? "combined" : "dev"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
}
