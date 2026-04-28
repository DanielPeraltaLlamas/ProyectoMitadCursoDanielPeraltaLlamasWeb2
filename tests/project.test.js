import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Client from "../src/models/Client.js";
import Project from "../src/models/Project.js";
import mongoose from 'mongoose';

export const setupProjectTest = async (suffix = Date.now()) => {
  const email = `user_proj_${suffix}@example.com`;
  const password = "Test123456";

  await request(app).post("/api/user/register").send({ email, password });
  const login = await request(app).post("/api/user/login").send({ email, password });
  const token = login.body.accessToken;

  await request(app)
    .patch("/api/user/company")
    .set("Authorization", `Bearer ${token}`)
    .send({
      isFreelance: true,
      name: `Empresa Proyectos ${suffix}`,
      lastName: "Owner",
      nif: `NIF${suffix % 100000}`,
      address: { street: "Calle Falsa 123", city: "Madrid", province: "Madrid", postal: "28001" }
    });

  const clientRes = await request(app)
    .post("/api/client")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: `Cliente para Proyecto ${suffix}`,
      cif: `CIF${suffix % 100000}`
    });

  const clientId = clientRes.body._id;

  return {
    token,
    clientId,
    suffix
  };
};

describe("MÓDULO DE PROYECTOS", () => {
  beforeEach(async () => {
    await Project.deleteMany({});
    await Client.deleteMany({});
  });

  describe("CREAR PROYECTO", () => {
    it("debería crear un proyecto correctamente", async () => {
      const { token, clientId, suffix } = await setupProjectTest("create");

      const projectData = {
        name: "Desarrollo Web E-commerce",
        projectCode: `PRJ-${suffix}`,
        client: clientId,
        email: "project@client.com",
        notes: "Entrega en 3 meses"
      };

      const res = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      expect(res.body.name).toBe(projectData.name);
      expect(res.body.projectCode).toBe(projectData.projectCode);
      expect(res.body.client).toBe(clientId);
    });

    it("debería fallar si el cliente no existe", async () => {
      const { token, suffix } = await setupProjectTest("fail_client");
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Proyecto Fallido",
          projectCode: `FAIL-${suffix}`,
          client: fakeId
        })
        .expect(404);
    });

    it("debería fallar si el código de proyecto está duplicado en la misma empresa", async () => {
      const { token, clientId } = await setupProjectTest("dup_code");
      const code = "UNIQUE-001";

      await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "P1", projectCode: code, client: clientId })
        .expect(201);

      const res = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "P2", projectCode: code, client: clientId })
        .expect(409);

      expect(res.body.error).toBe("Ya existe un proyecto con este código");
    });
  });

  describe("OBTENER PROYECTOS", () => {
    it("debería filtrar proyectos por nombre", async () => {
      const { token, clientId } = await setupProjectTest("filter");

      await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
        .send({ name: "Mantenimiento", projectCode: "MNT", client: clientId });
      await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
        .send({ name: "Instalación", projectCode: "INS", client: clientId });

      const res = await request(app)
        .get("/api/project?name=mante")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Mantenimiento");
    });

    it("debería filtrar por estado activo", async () => {
      const { token, clientId } = await setupProjectTest("status");

      const pRes = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
        .send({ name: "Inactivo", projectCode: "OFF", client: clientId });

      await request(app)
        .put(`/api/project/${pRes.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ active: false });

      const res = await request(app)
        .get("/api/project?active=false")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data[0].active).toBe(false);
    });
  });

  describe("ELIMINAR Y ARCHIVAR", () => {
    it("debería archivar el proyecto (borrado lógico)", async () => {
      const { token, clientId } = await setupProjectTest("soft_prj");
      const p = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
        .send({ name: "Archivable", projectCode: "ARC", client: clientId });

      await request(app)
        .delete(`/api/project/${p.body._id}?soft=true`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      const check = await Project.findOne({ _id: p.body._id }).setOptions({ withDeleted: true });
      expect(check).not.toBeNull();
      expect(check.deleted).toBe(true);
    });

    it("debería eliminar permanentemente (borrado físico)", async () => {
      const { token, clientId } = await setupProjectTest("hard_prj");
      const p = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
        .send({ name: "Eliminable", projectCode: "DEL", client: clientId });

      await request(app)
        .delete(`/api/project/${p.body._id}?soft=false`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const check = await Project.findById(p.body._id);
      expect(check).toBeNull();
    });
  });

  describe("OBTENER PROYECTO POR ID", () => {
    it("debería obtener un único proyecto", async () => {
      const { token, clientId } = await setupProjectTest("get_one");
      
      const createRes = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Proyecto Individual", projectCode: "IND-01", client: clientId });

      const res = await request(app)
        .get(`/api/project/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.name).toBe("Proyecto Individual");
    });

    it("debería devolver 404 si el proyecto no existe", async () => {
      const { token } = await setupProjectTest("not_found");
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/project/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  describe("ACTUALIZAR PROYECTO", () => {
    it("debería actualizar los campos del proyecto", async () => {
      const { token, clientId } = await setupProjectTest("update");
      
      const p = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Nombre Original", projectCode: "ORIG", client: clientId });

      const res = await request(app)
        .put(`/api/project/${p.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Nombre Editado", notes: "Nueva nota" })
        .expect(200);

      expect(res.body.name).toBe("Nombre Editado");
      expect(res.body.notes).toBe("Nueva nota");
    });
  });

  describe("RESTAURAR Y LISTA DE ARCHIVADOS", () => {
    it("debería listar solo los proyectos archivados", async () => {
      const { token, clientId } = await setupProjectTest("list_archived");
      
      const p = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Para Archivar", projectCode: "ARC-01", client: clientId });
      
      await request(app)
        .delete(`/api/project/${p.body._id}?soft=true`)
        .set("Authorization", `Bearer ${token}`);

      await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Activo", projectCode: "ACT-01", client: clientId });

      const res = await request(app)
        .get("/api/project/archived")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].projectCode).toBe("ARC-01");
    });

    it("debería restaurar un proyecto archivado", async () => {
      const { token, clientId } = await setupProjectTest("restore");
      
      const p = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Recuperable", projectCode: "REC-01", client: clientId });

      await request(app)
        .delete(`/api/project/${p.body._id}?soft=true`)
        .set("Authorization", `Bearer ${token}`);

      await request(app)
        .patch(`/api/project/${p.body._id}/restore`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const check = await Project.findById(p.body._id);
      expect(check.deleted).toBe(false);
    });
  });

});