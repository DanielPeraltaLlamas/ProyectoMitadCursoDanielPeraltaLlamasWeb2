import mongoose from "mongoose";

describe("DB SETUP (MongoMemoryServer)", () => {
  it("deberia de estar conectada", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});