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

import { validate } from "../middleware/validate.js";
import {
  createClientSchema,
  updateClientSchema,
  getClientsSchema
} from "../validators/client.validator.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/client:
 *   post:
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     summary: Crear cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif]
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   number: { type: string }
 *                   postal: { type: string }
 *                   city: { type: string }
 *                   province: { type: string }
 *     responses:
 *       201:
 *         description: Cliente creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: CIF duplicado
 */
router.post("/", authMiddleware, validate(createClientSchema), createClient);

/**
 * @openapi
 * /api/client:
 *   get:
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener clientes
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: string
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       400:
 *         description: Query inválida
 *       401:
 *         description: No autorizado
 */
router.get("/", authMiddleware, validate(getClientsSchema), getClients);

/**
 * @openapi
 * /api/client/archived:
 *   get:
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     summary: Clientes archivados
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 *       401:
 *         description: No autorizado
 */
router.get("/archived", authMiddleware, getArchivedClients);

/**
 * @openapi
 * /api/client/{id}:
 *   get:
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener cliente por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
 */
router.get("/:id", authMiddleware, getClientById);

/**
 * @openapi
 * /api/client/{id}:
 *   put:
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     summary: Actualizar cliente
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               cif: { type: string }
 *               email:
 *                 type: string
 *                 format: email
 *               phone: { type: string }
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   number: { type: string }
 *                   postal: { type: string }
 *                   city: { type: string }
 *                   province: { type: string }
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
 */
router.put("/:id", authMiddleware, validate(updateClientSchema), updateClient);

/**
 * @openapi
 * /api/client/{id}:
 *   delete:
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     summary: Eliminar cliente
 *     parameters:
 *       - name: deleteMethod
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: Eliminado o archivado
 *       400:
 *         description: Query inválida
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
 */
router.delete("/:id", authMiddleware, deleteClient);

/**
 * @openapi
 * /api/client/{id}/restore:
 *   patch:
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     summary: Restaurar cliente
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Cliente restaurado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
 */
router.patch("/:id/restore", authMiddleware, restoreClient);

export default router;