import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../utils/AppError";
import { FileService } from "./file.service";
import { sendResponse } from "../../utils/sendResponse";
import { FileType } from "../../constants";

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

const getFileById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    const file = await FileService.getFileById(userId, fileId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "File retrieved successfully",
      data: file,
    });
  },
);

const renameFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    const { name } = req.body;
    const file = await FileService.renameFile(userId, fileId, name);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "File renamed successfully",
      data: file,
    });
  },
);

const copyFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    const { targetFolderId } = req.body;
    const file = await FileService.copyFile(userId, fileId, targetFolderId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "File copied successfully",
      data: file,
    });
  },
);

const duplicateFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    const file = await FileService.duplicateFile(userId, fileId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "File duplicated successfully",
      data: file,
    });
  },
);

const deleteFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    await FileService.deleteFile(userId, fileId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "File deleted successfully",
    });
  },
);

const shareFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    const result = await FileService.shareFile(userId, fileId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Share link generated successfully",
      data: result,
    });
  },
);

const getSharedFile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const shareToken = req.params.shareToken as string;
    const file = await FileService.getSharedFile(shareToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shared file retrieved successfully",
      data: file,
    });
  },
);

const toggleFavorite = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    const file = await FileService.toggleFavorite(userId, fileId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `File ${file.isFavorite ? "added to" : "removed from"} favorites`,
      data: file,
    });
  },
);

const getFavorites = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const name = req.query.name as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await FileService.getFavorites(userId, {
      name,
      page,
      limit,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Favorites retrieved successfully",
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    });
  },
);

const togglePrivate = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const fileId = req.params.fileId as string;
    const { privateFolderId, targetFolderId } = req.body;
    const file = await FileService.togglePrivate(
      userId,
      fileId,
      privateFolderId,
      targetFolderId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `File is now ${file.isPrivate ? "private" : "public"}`,
      data: file,
    });
  },
);

const searchFiles = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const { name, type, startDate, endDate, page, limit } = req.query;

    const result = await FileService.searchFiles(userId, {
      name: name as string | undefined,
      type: type as FileType | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Search results retrieved successfully",
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    });
  },
);

export const FileController = {
  uploadFile,
  getFilesByFolder,
  getFileById,
  renameFile,
  copyFile,
  duplicateFile,
  deleteFile,
  shareFile,
  getSharedFile,
  toggleFavorite,
  getFavorites,
  togglePrivate,
  searchFiles,
};
