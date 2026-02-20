import { checkAuth } from "./../../middlewares/checkAuth";
import { Router } from "express";
import { validate } from "../../middlewares/validate";
import {
  createFolderSchema,
  createPrivateFolderSchema,
  renameFolderSchema,
} from "./folder.validation";
import { FolderController } from "./folder.controller";

const router = Router();

router.post(
  "/",
  checkAuth,
  validate(createFolderSchema),
  FolderController.createFolder,
);

router.post(
  "/private",
  checkAuth,
  validate(createPrivateFolderSchema),
  FolderController.createPrivateFolder,
);

router.get("/", checkAuth, FolderController.getFolders);

router.patch(
  "/:folderId",
  checkAuth,
  validate(renameFolderSchema),
  FolderController.renameFolder,
);

export const FolderRoutes = router;
