
import { Router } from "express";
import { validate } from "../middleware/validate.js";
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

userRouter.post("/register",validate(registerSchema), registerUser);
userRouter.put("/validation", validate(validateEmailSchema), validateEmail);
userRouter.post("/login", validate(loginSchema), loginUser);
userRouter.put("/register", validate(onboardingSchema), updatePersonalData);
userRouter.patch("/company", validate(onboardingSchema), updateCompanyData);
userRouter.patch("/logo", uploadLogo);
userRouter.get("/", getUser);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.delete("/", deleteUser);
userRouter.put("/password", validate(passwordSchema), changePassword);
userRouter.post("/invite", validate(inviteUserSchema), inviteUser);

export default userRouter;