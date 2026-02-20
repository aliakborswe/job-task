import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { IFolder, PaginationResult } from "./folder.interface";
import { Folder } from "./folder.model";

const createFolder = async (payload: Partial<IFolder>) => {
  const { name, userId } = payload;
  const folder = await Folder.create({ name, userId });
  return folder;
};

// get all folders service
const getFolders = async (
  userId: string,
  options: { includePrivate?: boolean; page?: number; limit?: number } = {},
): Promise<PaginationResult<IFolder>> => {
  const { includePrivate = false, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { userId };
  if (!includePrivate) {
    query.isPrivate = false;
  }

  const [folders, total] = await Promise.all([
    Folder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Folder.countDocuments(query),
  ]);

  return { data: folders, total, page, limit };
};

//rename folder service
const renameFolder = async (
  userId: string,
  folderId: string,
  name: string,
): Promise<IFolder> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new AppError(httpStatus.NOT_FOUND, "Folder not found");
  }

  folder.name = name;
  await folder.save();
  return folder;
};

export const FolderService = {
  createFolder,
  getFolders,
  renameFolder,
};
