import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("Auth routes", () => {
  it("POST /api/auth/login returns 400 without credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});
