import { checkAuth } from "./../../middlewares/checkAuth";
import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { createFolderSchema } from "./folder.validation";
import { FolderController } from "./folder.controller";

const router = Router();

router.post(
  "/",
  checkAuth,
  validate(createFolderSchema),
  FolderController.createFolder,
);

router.get("/", checkAuth, FolderController.getFolders);

export const FolderRoutes = router;
