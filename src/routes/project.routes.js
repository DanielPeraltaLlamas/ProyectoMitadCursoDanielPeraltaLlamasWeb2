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
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Proyecto creado
 *       400:
 *         $ref: '#/components/schemas/Error'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/schemas/Error'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         $ref: '#/components/schemas/Error'
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
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       400:
 *         $ref: '#/components/schemas/Error'
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
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: soft
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: Eliminado o archivado
 *       404:
 *         $ref: '#/components/schemas/Error'
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
 *         $ref: '#/components/schemas/Error'
 */
router.patch("/:id/restore", authMiddleware, restoreProject);

export default router;