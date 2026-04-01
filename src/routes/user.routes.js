
import { Router } from "express";
import { validate,validateBody } from "../middleware/validate.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import { uploadMiddleware } from "../middleware/upload.js";
import 
{
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

//rutas publicas
userRouter.post("/register",validate(registerSchema), registerUser);
userRouter.put("/validation", authMiddleware, validateBody(validateEmailSchema), validateEmail);
userRouter.post("/login", validate(loginSchema), loginUser);
userRouter.post("/refresh", refreshToken);
//rutas que requieren token
userRouter.use(authMiddleware);

userRouter.put("/register", validateBody(onboardingSchema), updatePersonalData);
userRouter.patch("/company", validateBody(onboardingSchema), updateCompanyData);
userRouter.patch("/logo",uploadMiddleware.single('logo'), uploadLogo);
userRouter.get("/", getUser);

userRouter.post("/logout", logoutUser);
userRouter.delete("/", deleteUser);
userRouter.put("/password", validate(passwordSchema), changePassword);

//rutas que requieren admin
userRouter.post("/invite", restrictTo('admin'), validate(inviteUserSchema), inviteUser);

export default userRouter;