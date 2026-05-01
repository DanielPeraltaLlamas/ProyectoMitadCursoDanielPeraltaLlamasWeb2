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
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente creado
 *       400:
 *         $ref: '#/components/schemas/Error'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         $ref: '#/components/schemas/Error'
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
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         $ref: '#/components/schemas/Error'
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
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: deleteMethod
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: Eliminado o archivado
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
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente restaurado
 */
router.patch("/:id/restore", authMiddleware, restoreClient);

export default router;