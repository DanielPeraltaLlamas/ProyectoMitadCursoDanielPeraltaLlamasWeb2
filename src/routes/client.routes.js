import { Router } from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  getArchivedClients,
  restoreClient
} from "../controllers/client.controller.js";

import { validate,validateBody } from "../middleware/validate.js";
import {
  createClientSchema,
  updateClientSchema,
  getClientsSchema
} from "../validators/client.validator.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, validate(createClientSchema), createClient);

router.get("/", authMiddleware, validate(getClientsSchema), getClients);

router.get("/archived", authMiddleware, getArchivedClients);

router.get("/:id", authMiddleware, getClientById);

router.put("/:id", authMiddleware, validate(updateClientSchema), updateClient);

router.delete("/:id", authMiddleware, deleteClient);

router.patch("/:id/restore", authMiddleware, restoreClient);

export default router;