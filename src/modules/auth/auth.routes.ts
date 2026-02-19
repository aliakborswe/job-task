import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { registerSchema, loginSchema } from "./auth.validation";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.createUser);
router.post("/login", validate(loginSchema), AuthController.login);

export const AuthRoutes = router;
