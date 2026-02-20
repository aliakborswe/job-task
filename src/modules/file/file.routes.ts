import { Router } from "express";
import { uploadFile } from "../../middlewares/upload";
import { FileController } from "./file.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { getFilesByFolderSchema } from "./file.validation";
import { validate } from "../../middlewares/validate";

const router = Router();

router.post(
  "/upload",
  checkAuth,
  uploadFile.single("file"),
  FileController.uploadFile,
);

router.get(
  "/folder/:folderId",
  checkAuth,
  validate(getFilesByFolderSchema),
  FileController.getFilesByFolder,
);

export const FileRoutes = router;
