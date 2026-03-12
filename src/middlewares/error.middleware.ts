import multer from "multer";
import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof Error) {
    if (err.message === "Not allowed by CORS") {
      return res.status(403).json({ message: "Origin not allowed." });
    }

    if (err.message === "Only JPG and PNG image uploads are allowed.") {
      return res.status(400).json({ message: err.message });
    }
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};
