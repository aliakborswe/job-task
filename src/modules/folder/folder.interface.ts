import { Types } from "mongoose";

export interface IFolder {
  _id: Types.ObjectId;
  name: string;
  userId: Types.ObjectId;
  isPrivate: boolean;
  storageUsed: number;
  createdAt: Date;
  updatedAt: Date;
}
