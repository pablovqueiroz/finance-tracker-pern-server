import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "../types/auth.types.js";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Malformed token.",
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
    ) as AuthTokenPayload;

    req.payload = decodedToken;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};
