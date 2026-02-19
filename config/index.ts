import express from "express";
import type { Application } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const FRONTEND_URL = process.env.ORIGIN || "http://localhost:5173";

export default function config(app: Application): void {
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: FRONTEND_URL,
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

  app.use(logger("dev"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
}
