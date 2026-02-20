import { Types } from "mongoose";
import { FileType } from "../../constants";

export interface IFile {
  _id: Types.ObjectId;
  name: string;
  originalName: string;
  type: FileType;
  mimeType: string;
  size: number;
  path: string;
  userId: Types.ObjectId;
  folderId: Types.ObjectId;
  isPrivate: boolean;
  isFavorite: boolean;
  shareToken?: string;
  shareTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface FileSearchOptions {
  name?: string;
  type?: FileType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}