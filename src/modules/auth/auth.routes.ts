import { Router } from "express";
import { validate } from "../../middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.createUser);
router.post("/login", validate(loginSchema), AuthController.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);

export const AuthRoutes = router;
