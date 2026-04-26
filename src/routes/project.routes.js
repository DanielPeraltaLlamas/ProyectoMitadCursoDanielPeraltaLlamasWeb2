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

import { validate, validateBody } from "../middleware/validate.js";

import {
  createProjectSchema,
  updateProjectSchema,
  getProjectsSchema
} from "../validators/project.validator.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, validate(createProjectSchema), createProject);

router.get("/", authMiddleware, validate(getProjectsSchema), getProjects);

router.get("/archived", authMiddleware, getArchivedProjects);

router.get("/:id", authMiddleware, getProjectById);

router.put("/:id", authMiddleware, validate(updateProjectSchema), updateProject);

router.delete("/:id", authMiddleware, deleteProject);

router.patch("/:id/restore", authMiddleware, restoreProject);

export default router;