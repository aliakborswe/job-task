import { Schema, Types, model } from "mongoose";
import { IFolder } from "./folder.interface";

const folderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    storageUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r["__v"];
        return ret;
      },
    },
  },
);


folderSchema.index({ userId: 1 });
folderSchema.index({ name: 1 });
folderSchema.index({ createdAt: -1 });
folderSchema.index({ userId: 1, name: 1 });

folderSchema.index(
  { userId: 1, isPrivate: 1 },
  { unique: true, partialFilterExpression: { isPrivate: true } },
);

export const Folder = model<IFolder>("Folder", folderSchema);