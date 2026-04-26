import { Router } from "express";
import {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNote,
  getDeliveryNotePDF,
  signDeliveryNote,
  deleteDeliveryNote
} from "../controllers/deliveryNote.controller.js";

import { validate, validateBody } from "../middleware/validate.js";

import {
  createDeliveryNoteSchema,
  getDeliveryNotesSchema,
  signDeliveryNoteSchema
} from "../validators/deliveryNote.validator.js";

import authMiddleware from "../middleware/auth.middleware.js";

import { uploadMiddleware } from "../middleware/upload.js";

const router = Router();

router.post("/", authMiddleware, validate(createDeliveryNoteSchema), createDeliveryNote);

router.get("/", authMiddleware, validate(getDeliveryNotesSchema), getDeliveryNotes);

router.get("/:id", authMiddleware, getDeliveryNote);

router.get("/pdf/:id", authMiddleware, getDeliveryNotePDF);

router.patch(
  "/:id/sign",
  authMiddleware,
  uploadMiddleware.single("signature"),
  validate(signDeliveryNoteSchema),
  signDeliveryNote
);

router.delete("/:id", authMiddleware, deleteDeliveryNote);

export default router;