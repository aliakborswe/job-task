import { Schema, model } from "mongoose";
import { IAuthProvider, IUser } from "./user.interface";

export const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false, versionKey: false },
);


const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    profileImage: {
      type: String,
      default: undefined,
    },
    isDeleted: { type: Boolean, default: false },
    auths: [authProviderSchema],
    privatePin: {
      type: String,
      select: false,
    },
    storageUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    pinFailedAttempts: {
      type: Number,
      default: 0,
    },
    pinLockedUntil: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r["password"];
        delete r["privatePin"];
        delete r["__v"];
        return ret;
      },
    },
  },
);

userSchema.index({ createdAt: -1 });

export const User = model<IUser>("User", userSchema);
