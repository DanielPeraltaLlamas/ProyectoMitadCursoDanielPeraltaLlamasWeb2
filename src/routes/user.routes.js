import { Router } from "express";
import { validate, validateBody } from "../middleware/validate.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import { uploadMiddleware } from "../middleware/upload.js";

import {
  registerUser,
  validateEmail,
  loginUser,
  updatePersonalData,
  updateCompanyData,
  uploadLogo,
  getUser,
  refreshToken,
  logoutUser,
  deleteUser,
  changePassword,
  inviteUser
} from "../controllers/user.controller.js";

import {
  registerSchema,
  validateEmailSchema,
  loginSchema,
  onboardingSchema,
  passwordSchema,
  inviteUserSchema
} from "../validators/user.validator.js";

const userRouter = Router();

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags: [User]
 *     summary: Registrar usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Email ya registrado o datos inválidos
 */
userRouter.post("/register", validate(registerSchema), registerUser);

/**
 * @openapi
 * /api/user/validation:
 *   put:
 *     tags: [User]
 *     summary: Validar email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 pattern: "^[0-9]{6}$"
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Usuario verificado
 *       400:
 *         description: Código incorrecto
 *       429:
 *         description: Sin intentos
 */
userRouter.put(
  "/validation",
  authMiddleware,
  validateBody(validateEmailSchema),
  validateEmail
);

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags: [User]
 *     summary: Login usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login correcto
 *       401:
 *         description: Credenciales incorrectas
 *       404:
 *         description: Usuario no encontrado
 */
userRouter.post("/login", validate(loginSchema), loginUser);

/**
 * @openapi
 * /api/user/refresh:
 *   post:
 *     tags: [User]
 *     summary: Refrescar token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado
 *       401:
 *         description: Refresh token inválido
 */
userRouter.post("/refresh", refreshToken);

userRouter.use(authMiddleware);

/**
 * @openapi
 * /api/user:
 *   get:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener usuario actual
 *     responses:
 *       200:
 *         description: Usuario actual
 */
userRouter.get("/", getUser);

/**
 * @openapi
 * /api/user:
 *   put:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Completar datos personales / empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   isFreelance:
 *                     type: boolean
 *                     example: true
 *                   name:
 *                     type: string
 *                     minLength: 2
 *                   lastName:
 *                     type: string
 *                     minLength: 2
 *                   nif:
 *                     type: string
 *                     minLength: 5
 *               - type: object
 *                 properties:
 *                   isFreelance:
 *                     type: boolean
 *                     example: false
 *                   name:
 *                     type: string
 *                     minLength: 2
 *                   lastName:
 *                     type: string
 *                     minLength: 2
 *                   cif:
 *                     type: string
 *                     minLength: 5
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       number:
 *                         type: string
 *                       postal:
 *                         type: string
 *                       city:
 *                         type: string
 *                       province:
 *                         type: string
 */
userRouter.put("/", validateBody(onboardingSchema), updatePersonalData);

/**
 * @openapi
 * /api/user/company:
 *   patch:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Crear o actualizar empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isFreelance
 *               - name
 *             properties:
 *               isFreelance:
 *                 type: boolean
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: string
 *                   postal:
 *                     type: string
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: compañía datos actualizados
 *       400:
 *         description: datos inválidos
 */
userRouter.patch("/company", validateBody(onboardingSchema), updateCompanyData);

/**
 * @openapi
 * /api/user/logo:
 *   patch:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Subir logo empresa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 */
userRouter.patch(
  "/logo",
  uploadMiddleware.single("logo"),
  uploadLogo
);

/**
 * @openapi
 * /api/user/logout:
 *   post:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Logout usuario
 */
userRouter.post("/logout", logoutUser);

/**
 * @openapi
 * /api/user:
 *   delete:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Eliminar usuario
 *     parameters:
 *       - name: soft
 *         in: query
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 */
userRouter.delete("/", deleteUser);

/**
 * @openapi
 * /api/user/password:
 *   put:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Cambiar contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 8
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 */
userRouter.put("/password", authMiddleware,validate(passwordSchema), changePassword);

/**
 * @openapi
 * /api/user/invite:
 *   post:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Invitar usuario
 *     description: Solo admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: Usuario invitado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Email ya existe
 */
userRouter.post(
  "/invite",
  restrictTo("admin"),
  validate(inviteUserSchema),
  inviteUser
);

export default userRouter;