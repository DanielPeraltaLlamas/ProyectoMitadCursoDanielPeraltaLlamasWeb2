import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Company from "../src/models/Company.js";
import Client from "../src/models/Client.js";
import mongoose from 'mongoose';

export const setupClientTest = async (suffix = Date.now()) => {
  const email = `user_client_${suffix}@example.com`;
  const password = "Test123456";

  await request(app).post("/api/user/register").send({ email, password });
  const login = await request(app).post("/api/user/login").send({ email, password });
  const token = login.body.accessToken;

  await request(app)
    .patch("/api/user/company")
    .set("Authorization", `Bearer ${token}`)
    .send({
      isFreelance: true,
      name: `Empresa de ${suffix}`,
      lastName: "Propietario",
      nif: `NIF${suffix % 100000}`,
      address: { street: "Calle Falsa 123", city: "Madrid", province: "Madrid", postal: "28001" }
    });

  const dbUser = await User.findOne({ email });

  return {
    token,
    user: dbUser,
    companyId: dbUser.company,
    password
  };
};

describe("MÓDULO DE CLIENTES", () => {

  describe("CREAR CLIENTE", () => {
    it("debería crear un nuevo cliente correctamente", async () => {
      const { token } = await setupClientTest("create");

      const clientData = {
        name: "Cliente de Prueba SL",
        cif: `CIF${Date.now() % 100000}`,
        email: "cliente@prueba.com",
        phone: "666777888",
        address: { street: "Via Gran", city: "Barcelona", province: "Barcelona", postal: "08001" }
      };

      const res = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send(clientData)
        .expect(201);

      expect(res.body.name).toBe(clientData.name);
      expect(res.body.company).toBeDefined();
    });

    it("debería fallar si el CIF ya existe en la misma empresa", async () => {
      const { token } = await setupClientTest("dup");
      const sharedCif = "B12345678";

      await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Cliente 1", cif: sharedCif })
        .expect(201);

      const res = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Cliente 2", cif: sharedCif })
        .expect(409);

      expect(res.body.error).toBe("Cliente con este CIF ya existe");
    });
  });

  describe("OBTENER CLIENTES", () => {
    it("debería listar los clientes de la empresa actual", async () => {
      const { token } = await setupClientTest("list");
      
      await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
        .send({ name: "Alfa", cif: "CIF1" });
      await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
        .send({ name: "Beta", cif: "CIF2" });

      const res = await request(app)
        .get("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.totalItems).toBeDefined();
    });
  });

  describe("ACTUALIZAR CLIENTE", () => {
    it("debería actualizar los datos del cliente correctamente", async () => {
      const { token } = await setupClientTest("update");

      const createRes = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Original", cif: "CIF_ORIG" });

      const clientId = createRes.body._id;

      const res = await request(app)
        .put(`/api/client/${clientId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Actualizado", phone: "999999999" })
        .expect(200);

      expect(res.body.name).toBe("Actualizado");
      expect(res.body.phone).toBe("999999999");
    });
  });

  describe("ELIMINAR Y ARCHIVAR", () => {
    it("debería archivar al cliente (borrado lógico)", async () => {
      const { token } = await setupClientTest("soft");
      const createRes = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Para Archivar", cif: "CIF_SOFT" });

      const clientId = createRes.body._id;

      const res = await request(app)
        .delete(`/api/client/${clientId}?deleteMethod=true`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe("Cliente archivado correctamente");
      
      const listRes = await request(app)
        .get("/api/client")
        .set("Authorization", `Bearer ${token}`);
      
      expect(listRes.body.data.find(c => c._id === clientId)).toBeUndefined();
    });

    it("debería eliminar al cliente permanentemente (borrado físico)", async () => {
      const { token } = await setupClientTest("hard");
      const createRes = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Para Borrar", cif: "CIF_HARD" });

      const clientId = createRes.body._id;

      await request(app)
        .delete(`/api/client/${clientId}?deleteMethod=false`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const dbClient = await Client.findById(clientId);
      expect(dbClient).toBeNull();
    });
  });

  describe("RESTAURAR CLIENTE", () => {
    it("debería restaurar un cliente archivado", async () => {
      const { token } = await setupClientTest("restore");
      const createRes = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Resucitado", cif: "CIF_RESTORE" });

      const clientId = createRes.body._id;

      await request(app).delete(`/api/client/${clientId}?deleteMethod=true`).set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .patch(`/api/client/${clientId}/restore`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe("Cliente restaurado correctamente");
    });
  });

  describe("BÚSQUEDA Y PAGINACIÓN", () => {
    it("debería filtrar clientes por nombre (insensible a mayúsculas)", async () => {
      const { token } = await setupClientTest("search");
      
      await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
        .send({ name: "Apple Inc", cif: "CIF_APPLE" });
      await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
        .send({ name: "Microsoft", cif: "CIF_MS" });

      const res = await request(app)
        .get("/api/client?name=apple")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Apple Inc");
    });
  });

  describe("ACCESO A CLIENTES ARCHIVADOS", () => {
    it("debería devolver solo clientes eliminados en la ruta de archivados", async () => {
      const { token } = await setupClientTest("archive_list");
      
      await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
        .send({ name: "Activo", cif: "C1" });
      const c2 = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
        .send({ name: "Borrado", cif: "C2" });

      await request(app)
        .delete(`/api/client/${c2.body._id}?deleteMethod=true`)
        .set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .get("/api/client/archived")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.some(c => c.name === "Borrado")).toBe(true);
      expect(res.body.data.some(c => c.name === "Activo")).toBe(false);
    });
  });

});