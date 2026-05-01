import request from "supertest";
import app from "../src/app.js";
import DeliveryNote from "../src/models/DeliveryNote.js";

const BASE_URL = "/api/deliverynote";

const setupFullContext = async (idSuffix) => {
  const salt = Math.floor(Math.random() * 1000000);
  const email = `user_${idSuffix}_${salt}@example.com`;
  const password = "Test123456";

  await request(app).post("/api/user/register").send({ email, password });
  const login = await request(app).post("/api/user/login").send({ email, password });
  const token = login.body.accessToken;

  await request(app)
    .patch("/api/user/company")
    .set("Authorization", `Bearer ${token}`)
    .send({
      isFreelance: true,
      name: `Empresa ${idSuffix}`,
      lastName: "Owner",
      nif: `NIF${salt}`,
      address: { street: "Calle Falsa", city: "Madrid", province: "Madrid", postal: "28001" }
    });

  const clientRes = await request(app)
    .post("/api/client")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: `Cliente ${idSuffix}`, cif: `CIF${salt}` });
  
  const projectRes = await request(app)
    .post("/api/project")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: `Proyecto ${idSuffix}`, projectCode: `P${salt}`, client: clientRes.body._id });

  return { token, clientId: clientRes.body._id, projectId: projectRes.body._id };
};

describe("MÓDULO DE ALBARANES", () => {
  
  beforeEach(async () => {
    await DeliveryNote.deleteMany({});
  });

  describe("POST /api/deliverynote (Lógica de Validación)", () => {
    
    it("debería crear un albarán de tipo MATERIAL", async () => {
      const { token, clientId, projectId } = await setupFullContext("mat");

      const res = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: "material",
          workDate: "2026-04-27",
          material: "Ladrillos",
          quantity: 500,
          unit: "unidades"
        })
        .expect(201);

      expect(res.body.material).toBe("Ladrillos");
    });

    it("debería crear un albarán de tipo HORAS", async () => {
      const { token, clientId, projectId } = await setupFullContext("hrs");

      const res = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: "hours",
          workDate: "2026-04-27",
          hours: 8,
          workers: [{ name: "Operario A", hours: 8 }]
        })
        .expect(201);

      expect(res.body.format).toBe("hours");
    });

    it("debería fallar si al formato MATERIAL le falta el campo de material", async () => {
      const { token, clientId, projectId } = await setupFullContext("fail");

      const res = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: "material",
          workDate: "2026-04-27"
        })
        .expect(400);

      expect(res.body.detalles[0].mensaje).toContain("tipo de albarán");
    });
  });


  describe("GET /api/deliverynote (Filtros)", () => {
    it("debería filtrar por rango de fechas de trabajo", async () => {
      const { token, clientId, projectId } = await setupFullContext("dates");

      await request(app).post(BASE_URL).set("Authorization", `Bearer ${token}`)
        .send({ project: projectId, client: clientId, format: "material", workDate: "2026-02-15", material: "A", quantity: 1 });

      const res = await request(app)
        .get(`${BASE_URL}?from=2026-02-01&to=2026-02-28`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("GET /:id", () => {
    it("debería obtener un albarán específico por ID con los campos poblados", async () => {
      const { token, clientId, projectId } = await setupFullContext("get_one");

      const createRes = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: "material",
          workDate: "2026-04-27",
          material: "Cableado",
          quantity: 20
        });

      const res = await request(app)
        .get(`${BASE_URL}/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty("project");
      expect(res.body.project.name).toBeDefined();
    });

    it("debería devolver 404 para un albarán inexistente", async () => {
      const { token } = await setupFullContext("not_found");
      const fakeId = "60d5ecb84f150428f8000000";

      await request(app)
        .get(`${BASE_URL}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  describe("DELETE /:id", () => {
    it("debería eliminar un albarán no firmado", async () => {
      const { token, clientId, projectId } = await setupFullContext("delete_ok");

      const createRes = await request(app)
        .post(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          project: projectId,
          client: clientId,
          format: "material",
          workDate: "2026-04-27",
          material: "Tubos",
          quantity: 5
        });

      await request(app)
        .delete(`${BASE_URL}/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const deletedNote = await DeliveryNote.findById(createRes.body._id);
      expect(deletedNote).toBeNull();
    });

    
  });
});