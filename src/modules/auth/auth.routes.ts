import { Router } from "express";
import { validate } from "../../middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
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

export const AuthRoutes = router;
