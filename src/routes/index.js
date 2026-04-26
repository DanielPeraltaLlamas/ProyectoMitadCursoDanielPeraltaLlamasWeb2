import express from "express";

import userRoutes from "./user.routes.js";
import clientRoutes from "./client.routes.js";
import projectRoutes from "./project.routes.js";
import deliverynoteRoutes from "./deliveryNote.routes.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/client", clientRoutes);
router.use("/project", projectRoutes);
router.use("/deliverynote", deliverynoteRoutes);

export default router;