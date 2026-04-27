import { Router } from "express";
import {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  getDeliveryNotePDF,
  signDeliveryNote,
  deleteDeliveryNote
} from "../controllers/deliveryNote.controller.js";

import { validate } from "../middleware/validate.js";

import {
  createDeliveryNoteSchema,
  getDeliveryNotesSchema,
  signDeliveryNoteSchema
} from "../validators/deliveryNote.validator.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = Router();

/**
 * @openapi
 * /api/deliverynote:
 *   post:
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     summary: Crear albarán
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project
 *               - client
 *               - format
 *               - workDate
 *             properties:
 *               project:
 *                 type: string
 *               client:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [material, hours]
 *               description:
 *                 type: string
 *               workDate:
 *                 type: string
 *                 format: date
 *               material:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               hours:
 *                 type: number
 *               workers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     hours:
 *                       type: number
 *     responses:
 *       201:
 *         description: Albarán creado
 *       404:
 *         description: Proyecto o cliente no válido
 */
router.post("/", authMiddleware, validate(createDeliveryNoteSchema), createDeliveryNote);

/**
 * @openapi
 * /api/deliverynote:
 *   get:
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener albaranes
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *       - name: project
 *         in: query
 *         schema:
 *           type: string
 *       - name: client
 *         in: query
 *         schema:
 *           type: string
 *       - name: format
 *         in: query
 *         schema:
 *           type: string
 *           enum: [material, hours]
 *       - name: signed
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get("/", authMiddleware, validate(getDeliveryNotesSchema), getDeliveryNotes);

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   get:
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener albarán
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       404:
 *         description: No encontrado
 */
router.get("/:id", authMiddleware, getDeliveryNote);

/**
 * @openapi
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     summary: Descargar PDF
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: No encontrado
 */
router.get("/pdf/:id", authMiddleware, getDeliveryNotePDF);

/**
 * @openapi
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     summary: Firmar albarán
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Firmado correctamente
 *       400:
 *         description: Ya firmado o inválido
 *       404:
 *         description: No encontrado
 */
router.patch(
  "/:id/sign",
  authMiddleware,
  uploadMiddleware.single("signature"),
  validate(signDeliveryNoteSchema),
  signDeliveryNote
);

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   delete:
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     summary: Eliminar albarán
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Eliminado correctamente
 *       400:
 *         description: No se puede borrar (firmado)
 *       404:
 *         description: No encontrado
 */
router.delete("/:id", authMiddleware, deleteDeliveryNote);

export default router;