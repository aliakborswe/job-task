import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import { FolderService } from "./folder.service";
import { sendResponse } from "../../utils/sendResponse";
import { Types } from "mongoose";

const createFolder = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as { userId: string };

  const { name } = req.body;
  const folder = await FolderService.createFolder({
    name,
    userId: new Types.ObjectId(userId),
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Folder created successfully",
    data: folder,
  });
});

// get all folders controller
const getFolders = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await FolderService.getFolders(userId, { page, limit });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Folders retrieved successfully",
      data: result,
      meta: { page: result.page, limit: result.limit, total: result.total },
    });
  },
);

// rename folder controller
const renameFolder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const folderId = req.params.folderId as string;
    const { name } = req.body;
    const folder = await FolderService.renameFolder(userId, folderId, name);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Folder renamed successfully",
      data: folder,
    });
  },
);

// create private folder controller
const createPrivateFolder = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const { name, pin } = req.body;
    const folder = await FolderService.createPrivateFolder(userId, name, pin);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Private folder created successfully",
      data: folder,
    });
  },
);

export const FolderController = {
  createFolder,
  getFolders,
  renameFolder,
  createPrivateFolder,
};
