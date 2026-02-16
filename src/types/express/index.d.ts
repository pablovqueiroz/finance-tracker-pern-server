import type { AuthTokenPayload } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      payload?: AuthTokenPayload;
      file?: Express.Multer.File;
    }
  }
}

export {};
