import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { registerSchema } from "./auth.validation";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.createUser);
router.post("/login", AuthController.login);

export const AuthRoutes = router;
