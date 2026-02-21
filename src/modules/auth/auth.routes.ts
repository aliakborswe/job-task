import { checkAuth } from "./../../middlewares/checkAuth";
import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { validate } from "../../middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";
import { AuthController } from "./auth.controller";
import { envVars } from "../../config/env";

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

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  },
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.CLIENT_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
  }),
  AuthController.googleCallbackController,
);

export const AuthRoutes = router;
