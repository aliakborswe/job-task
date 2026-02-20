import { Router } from "express";
import { uploadFile } from "../../middlewares/upload";
import { FileController } from "./file.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import {
  copyFileSchema,
  getFilesByFolderSchema,
  renameFileSchema,
} from "./file.validation";
import { validate } from "../../middlewares/validate";

const router = Router();

router.post(
  "/upload",
  checkAuth,
  uploadFile.single("file"),
  FileController.uploadFile,
);

router.post(
  "/copy/:fileId",
  checkAuth,
  validate(copyFileSchema),
  FileController.copyFile,
);

router.get(
  "/folder/:folderId",
  checkAuth,
  validate(getFilesByFolderSchema),
  FileController.getFilesByFolder,
);

router.get("/:fileId", checkAuth, FileController.getFileById);
router.patch(
  "/rename/:fileId",
  checkAuth,
  validate(renameFileSchema),
  FileController.renameFile,
);

export const FileRoutes = router;
