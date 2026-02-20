import { Router } from "express";
import { uploadFile } from "../../middlewares/upload";
import { FileController } from "./file.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import {
  copyFileSchema,
  deleteFileSchema,
  duplicateFileSchema,
  getFilesByFolderSchema,
  getSharedFileSchema,
  renameFileSchema,
  searchFilesSchema,
  shareFileSchema,
  toggleFavoriteSchema,
  togglePrivateSchema,
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
  "/search",
  checkAuth,
  validate(searchFilesSchema),
  FileController.searchFiles,
);
router.get("/favorites", checkAuth, FileController.getFavorites);
router.get(
  "/shared/:shareToken",
  validate(getSharedFileSchema),
  FileController.getSharedFile,
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

router.post(
  "/share/:fileId",
  checkAuth,
  validate(shareFileSchema),
  FileController.shareFile,
);

router.patch(
  "/favorite/:fileId",
  checkAuth,
  validate(toggleFavoriteSchema),
  FileController.toggleFavorite,
);

router.patch(
  "/private/:fileId",
  checkAuth,
  validate(togglePrivateSchema),
  FileController.togglePrivate,
);

router.delete(
  "/:fileId",
  checkAuth,
  validate(deleteFileSchema),
  FileController.deleteFile,
);

export const FileRoutes = router;
