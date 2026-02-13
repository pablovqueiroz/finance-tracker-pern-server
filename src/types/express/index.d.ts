import "express";
import type { JwtPayload } from "jsonwebtoken";
import type { File } from "multer";

declare global {
  namespace Express {
    interface Request {
      payload?: string | JwtPayload;
      file?: File;
    }
  }
}