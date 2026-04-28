import request from "supertest";
import app from "../src/app.js";

describe("AUTH MIDDLEWARE", () => {
  it("Sin token → 401", async () => {
    const res = await request(app)
      .get("/api/client");

    expect(res.statusCode).toBe(401);
  });

  it("Token Invalido → 401", async () => {
    const res = await request(app)
      .get("/api/client")
      .set("Authorization", "Bearer token-invalido");

    expect(res.statusCode).toBe(401);
  });
});