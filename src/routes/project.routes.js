import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getArchivedProjects,
  restoreProject
} from "../controllers/project.controller.js";

import { validate } from "../middleware/validate.js";

import {
  createProjectSchema,
  updateProjectSchema,
  getProjectsSchema
} from "../validators/project.validator.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/project:
 *   post:
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     summary: Crear proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, projectCode, client]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *               projectCode:
 *                 type: string
 *                 minLength: 1
 *               client:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   number: { type: string }
 *                   postal: { type: string }
 *                   city: { type: string }
 *                   province: { type: string }
 *               email:
 *                 type: string
 *                 format: email
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proyecto creado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cliente no válido
 *       409:
 *         description: Código duplicado
 */
router.post("/", authMiddleware, validate(createProjectSchema), createProject);

/**
 * @openapi
 * /api/project:
 *   get:
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener proyectos
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: string
 *       - name: client
 *         in: query
 *         schema:
 *           type: string
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *       - name: active
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *       400:
 *         description: Query inválida
 */
router.get("/", authMiddleware, validate(getProjectsSchema), getProjects);

/**
 * @openapi
 * /api/project/archived:
 *   get:
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener proyectos archivados
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get("/archived", authMiddleware, getArchivedProjects);

/**
 * @openapi
 * /api/project/{id}:
 *   get:
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener proyecto por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: No encontrado
 */
router.get("/:id", authMiddleware, getProjectById);

/**
 * @openapi
 * /api/project/{id}:
 *   put:
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     summary: Actualizar proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               projectCode:
 *                 type: string
 *               client:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   number: { type: string }
 *                   postal: { type: string }
 *                   city: { type: string }
 *                   province: { type: string }
 *               email:
 *                 type: string
 *                 format: email
 *               notes:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Proyecto no encontrado
 */
router.put("/:id", authMiddleware, validate(updateProjectSchema), updateProject);

/**
 * @openapi
 * /api/project/{id}:
 *   delete:
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     summary: Eliminar proyecto
 *     parameters:
 *       - name: soft
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: Eliminado o archivado
 *       404:
 *         description: No encontrado
 */
router.delete("/:id", authMiddleware, deleteProject);

/**
 * @openapi
 * /api/project/{id}/restore:
 *   patch:
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     summary: Restaurar proyecto
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto restaurado
 *       404:
 *         description: No encontrado
 */
router.patch("/:id/restore", authMiddleware, restoreProject);

export default router;