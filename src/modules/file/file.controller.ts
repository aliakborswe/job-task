import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../utils/AppError";
import { FileService } from "./file.service";
import { sendResponse } from "../../utils/sendResponse";

const uploadFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const { folderId, name } = req.body;

    if (!req.file) {
      throw new AppError(httpStatus.BAD_REQUEST, "No file provided");
    }

    const file = await FileService.uploadFile(userId, folderId, req.file, name);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "File uploaded successfully",
      data: file,
    });
  },
);

const getFilesByFolder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const folderId = req.params.folderId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await FileService.getFilesByFolder(
      userId,
      folderId,
      page,
      limit,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Files retrieved successfully",
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    });
  },
);

export const FileController = {
  uploadFile,
  getFilesByFolder,
};
