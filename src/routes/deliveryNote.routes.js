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
import { uploadMiddlewareCloud } from "../middleware/upload.cloud.middleware.js";

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
 *             $ref: '#/components/schemas/DeliveryNote'
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
 */
router.patch(
  "/:id/sign",
  authMiddleware,
  uploadMiddlewareCloud.single("signature"),
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
 */
router.delete("/:id", authMiddleware, deleteDeliveryNote);

export default router;