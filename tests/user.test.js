import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import mongoose from 'mongoose';

export const createUserAndLogin = async (suffix = Date.now()) => {
  const email = `test_${suffix}@example.com`;
  const password = "Test123456";

  await request(app)
    .post("/api/user/register")
    .send({ email, password })
    .expect(201);

  const login = await request(app)
    .post("/api/user/login")
    .send({ email, password })
    .expect(200);

  const dbUser = await User.findOne({ email });

  if (!dbUser) {
    throw new Error("Usuario no encontrado en la DB tras el registro");
  }

  return {
    email,
    password,
    token: login.body.accessToken,
    refreshToken: login.body.refreshToken,
    verificationCode: dbUser.verificationCode
  };
};

describe("FLUJO DE USUARIO", () => {

  beforeAll(async () => {
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });


  describe("REGISTRO", () => {
    it("debería registrar al usuario e iniciar sesión", async () => {
      const user = await createUserAndLogin("registro");

      expect(user.token).toBeDefined();
      expect(user.refreshToken).toBeDefined();
    });
  });

  describe("INICIO DE SESIÓN", () => {
    it("debería iniciar sesión correctamente", async () => {
      const user = await createUserAndLogin("login");

      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: user.email,
          password: user.password
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe("VALIDACIÓN DE EMAIL", () => {
    it("debería verificar el email correctamente", async () => {
      const user = await createUserAndLogin("email");

      const res = await request(app)
        .put("/api/user/validation")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ code: user.verificationCode })
        .expect(200);

      expect(res.body.message).toBe("usuario verificado");
    });
  });

  describe("ACTUALIZAR DATOS PERSONALES", () => {
    it("debería actualizar los datos personales", async () => {
      const user = await createUserAndLogin("personal");

      const res = await request(app)
        .put("/api/user")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          name: "Juan",
          lastName: "Perez",
          nif: "12345678A",
          isFreelance: true
        })
        .expect(200);

      expect(res.body.message).toBe("datos personales actualizados");
    });
  });

  describe("ACTUALIZAR DATOS DE EMPRESA", () => {

    it("debería crear una empresa (autónomo/freelance)", async () => {
      const user = await createUserAndLogin("company1");

      const res = await request(app)
        .patch("/api/user/company")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          isFreelance: true,
          name: "Mi Empresa",
          lastName: "Test",
          nif: "12345678A",
          cif: "12345678A",
          address: {
            street: "Calle Test",
            number: "1",
            postal: "28001",
            city: "Madrid",
            province: "Madrid"
          }
        })
        .expect(200);

      expect(res.body.message).toBe("compañía datos actualizados");
    });

    it("debería crear una empresa (sociedad/no freelance)", async () => {
      const user = await createUserAndLogin("company2");

      const res = await request(app)
        .patch("/api/user/company")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          isFreelance: false,
          name: "Empresa SL",
          lastName: "Test",
          nif: "12345678A",
          cif: "B12345678",
          address: {
            street: "Calle Test",
            number: "2",
            postal: "28002",
            city: "Madrid",
            province: "Madrid"
          }
        })
        .expect(200);

      expect(res.body.message).toBe("compañía datos actualizados");
    });

  });

  describe("SUBIR LOGO", () => {

    it("debería fallar si no se sube ningún archivo", async () => {
      const user = await createUserAndLogin("logo1");

      await request(app)
        .patch("/api/user/company")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          isFreelance: true,
          name: "Mi Empresa",
          lastName: "Test",
          nif: "12345678A",
          address: {
            street: "Calle Test",
            number: "1",
            postal: "28001",
            city: "Madrid",
            province: "Madrid"
          }
        });

      const res = await request(app)
        .patch("/api/user/logo")
        .set("Authorization", `Bearer ${user.token}`)
        .expect(400);

      expect(res.body.error || res.body.message).toBeDefined();
    });

    it("debería subir el logo correctamente", async () => {
      const user = await createUserAndLogin(`logo_final_${Date.now()}`);

      const uniqueNif = `NIF${Date.now() % 1000000}`;
      await request(app)
        .patch("/api/user/company")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          isFreelance: true,
          name: "Empresa Logo Test",
          lastName: "Jose",
          nif: uniqueNif,
          address: {
            street: "Calle Test",
            number: "1",
            postal: "28001",
            city: "Madrid",
            province: "Madrid"
          }
        })
        .expect(200);

      const res = await request(app)
        .patch("/api/user/logo")
        .set("Authorization", `Bearer ${user.token}`) 
        .attach("logo", Buffer.from("fake-image"), "logo.png")
        .expect(200);

      expect(res.body.message).toBe("Logo subido correctamente");
      expect(res.body.logo).toContain("http://localhost:3000/uploads/");
    });

  });

  describe("OBTENER USUARIO", () => {
    it("debería devolver los datos del usuario", async () => {
      const user = await createUserAndLogin("get");

      const res = await request(app)
        .get("/api/user")
        .set("Authorization", `Bearer ${user.token}`)
        .expect(200);

      expect(res.body.user).toBeDefined();
    });

    it("debería fallar sin token de autenticación", async () => {
      await request(app)
        .get("/api/user")
        .expect(401);
    });
  });

  describe("REFRESCAR TOKEN", () => {
    it("debería refrescar el token de acceso", async () => {
      const user = await createUserAndLogin("refresh");

      const res = await request(app)
        .post("/api/user/refresh")
        .send({ refreshToken: user.refreshToken })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe("CERRAR SESIÓN", () => {
    it("debería cerrar la sesión correctamente", async () => {
      const user = await createUserAndLogin("logout");

      const res = await request(app)
        .post("/api/user/logout")
        .set("Authorization", `Bearer ${user.token}`)
        .expect(200);

      expect(res.body.message).toBe("Log out");
    });
  });

  describe("ELIMINAR USUARIO", () => {
    it("debería eliminar al usuario de forma permanente", async () => {
      const user = await createUserAndLogin("delete");

      const res = await request(app)
        .delete("/api/user?soft=false")
        .set("Authorization", `Bearer ${user.token}`)
        .expect(200);

      expect(res.body.message).toBe("Usuario eliminado");
    });

    it("debería fallar al intentar eliminar sin token", async () => {
      await request(app)
        .delete("/api/user")
        .expect(401);
    });
  });

  describe("CAMBIAR CONTRASEÑA", () => {

    it("debería cambiar la contraseña correctamente", async () => {
      const user = await createUserAndLogin("pass");

      const res = await request(app)
        .put("/api/user/password")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          currentPassword: user.password,
          newPassword: "NewPass123456"
        })
        .expect(200);

      expect(res.body.message).toBe("contraseña actualizada");
    });

    it("debería fallar con una contraseña actual incorrecta", async () => {
      const user = await createUserAndLogin("pass2");

      await request(app)
        .put("/api/user/password")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          currentPassword: "wrongPassword123",
          newPassword: "whatever123"
        })
        .expect(401);
    });

    it("debería fallar al intentar cambiar la contraseña sin token", async () => {
      await request(app)
        .put("/api/user/password")
        .send({
          currentPassword: "Test123456",
          newPassword: "NewPass123456"
        })
        .expect(401);
    });
  });

  describe("INVITAR USUARIO", () => {
    it("debería invitar a un nuevo usuario correctamente como administrador", async () => {
      const adminData = await createUserAndLogin(`admin_inviter_${Date.now()}`);
      const adminUser = await User.findOne({ email: adminData.email });

      await User.findByIdAndUpdate(adminUser._id, { 
        role: 'admin',
        company: new mongoose.Types.ObjectId() 
      });

      const res = await request(app)
        .post("/api/user/invite")
        .set("Authorization", `Bearer ${adminData.token}`)
        .send({
          email: `guest_${Date.now()}@example.com`,
          name: "Invitado",
          lastName: "Prueba"
        })
        .expect(201);

      expect(res.body.message).toBe("usuario invitado");
      expect(res.body.user.role).toBe("guest");
      expect(res.body.user.status).toBe("pending");
    });

    it("debería fallar si quien invita no es administrador", async () => {
      const commonUserData = await createUserAndLogin("common_user");
      const commonUser = await User.findOne({ email: commonUserData.email });
      
      await User.findByIdAndUpdate(commonUser._id, { role: 'guest' }); 

      await request(app)
        .post("/api/user/invite")
        .set("Authorization", `Bearer ${commonUserData.token}`)
        .send({
          email: `fail_${Date.now()}@example.com`,
          name: "No",
          lastName: "Permitido"
        })
        .expect(403);
    });

    it("debería fallar si el email ya está registrado", async () => {
      const adminData = await createUserAndLogin("admin_bulk");
      const adminUser = await User.findOne({ email: adminData.email });
      
      await User.findByIdAndUpdate(adminUser._id, { role: 'admin' });

      await request(app)
        .post("/api/user/invite")
        .set("Authorization", `Bearer ${adminData.token}`)
        .send({
          email: adminData.email, 
          name: "Duplicado",
          lastName: "Test"
        })
        .expect(409);
    });
  }); 

});