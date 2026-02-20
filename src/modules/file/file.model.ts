import { Schema, model} from "mongoose";
import { IFile } from "./file.interface";

const fileSchema = new Schema<IFile>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["note", "image", "pdf"],
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    path: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      default: undefined,
    },
    shareTokenExpiry: {
      type: Date,
      default: undefined,
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


fileSchema.index({ userId: 1 });
fileSchema.index({ folderId: 1 });
fileSchema.index({ name: 1 });
fileSchema.index({ type: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ userId: 1, type: 1 });
fileSchema.index({ userId: 1, isFavorite: 1 });
fileSchema.index({ shareToken: 1 });

export const File = model<IFile>("File", fileSchema);
