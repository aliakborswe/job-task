import { Router } from "express";
import { UserController } from "./user.controller";
import { validate } from "../../middlewares/validate";
import {
  changePasswordSchema,
  changeUserNameSchema,
  setPinSchema,
  verifyPinSchema,
} from "./user.valildation";
import { uploadProfileImage } from "../../middlewares/upload";
import { pinRateLimiter } from "../../middlewares/rateLimiter";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/profile", checkAuth, UserController.getProfile);

router.get("/storage", checkAuth, UserController.getStorage);

router.patch(
  "/name",
  checkAuth,
  validate(changeUserNameSchema),
  UserController.changeUserName,
);

router.patch(
  "/password",
  checkAuth,
  validate(changePasswordSchema),
  UserController.changePassword,
);

router.patch(
  "/profile-image",
  checkAuth,
  uploadProfileImage.single("profileImage"),
  UserController.uploadProfileImage,
);

router.post("/pin", checkAuth, validate(setPinSchema), UserController.setPin);

router.post(
  "/pin/verify",
  checkAuth,
  pinRateLimiter,
  validate(verifyPinSchema),
  UserController.verifyPin,
);

router.post("/logout", checkAuth, UserController.logout);

router.delete("/account", checkAuth, UserController.deleteAccount);

export const UserRoutes = router;
