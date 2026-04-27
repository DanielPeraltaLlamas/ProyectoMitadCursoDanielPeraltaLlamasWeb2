import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Proyecto final web",
      version: "1.0.0",
      description: "Proyecto final web Daniel Peralta"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Practica final"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },

      schemas: {

        User: {
          type: "object",
          properties: {
            email: { type: "string" },
            name: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["admin", "guest"] },
            status: { type: "string", enum: ["pending", "verified"] },
            nif: { type: "string" },
            company: { type: "string" }
          }
        },

        Company: {
          type: "object",
          properties: {
            name: { type: "string" },
            cif: { type: "string" },
            logo: { type: "string" },
            isFreelance: { type: "boolean" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                number: { type: "string" },
                postal: { type: "string" },
                city: { type: "string" },
                province: { type: "string" }
              }
            }
          }
        },

        Client: {
          type: "object",
          properties: {
            name: { type: "string" },
            cif: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                number: { type: "string" },
                postal: { type: "string" },
                city: { type: "string" },
                province: { type: "string" }
              }
            }
          }
        },

        Project: {
          type: "object",
          properties: {
            name: { type: "string" },
            projectCode: { type: "string" },
            client: { type: "string" },
            email: { type: "string" },
            notes: { type: "string" }
          }
        },

        DeliveryNote: {
          type: "object",
          properties: {
            project: { type: "string" },
            client: { type: "string" },
            format: { type: "string", enum: ["material", "hours"] },
            description: { type: "string" },
            workDate: { type: "string", format: "date" },
            material: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" },
            hours: { type: "number" },
            signed: { type: "boolean" }
          }
        },

        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

export default swaggerJsdoc(options);