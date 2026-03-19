
import { Router } from "express";
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

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.put("/validation", validateEmail);
userRouter.post("/login", loginUser);
userRouter.put("/register", updatePersonalData);
userRouter.patch("/company", updateCompanyData);
userRouter.patch("/logo", uploadLogo);
userRouter.get("/", getUser);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.delete("/", deleteUser);
userRouter.put("/password", changePassword);
userRouter.post("/invite", inviteUser);

export default userRouter;