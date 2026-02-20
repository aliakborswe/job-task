import { Router } from "express";
import { uploadFile } from "../../middlewares/upload";
import { FileController } from "./file.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import {
  copyFileSchema,
  deleteFileSchema,
  duplicateFileSchema,
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

router.post(
  "/duplicate/:fileId",
  checkAuth,
  validate(duplicateFileSchema),
  FileController.duplicateFile,
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

router.delete(
  "/:fileId",
  checkAuth,
  validate(deleteFileSchema),
  FileController.deleteFile,
);

export const FileRoutes = router;
