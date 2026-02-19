import { Types } from 'mongoose';

export interface IAuthProvider {
  provider: "google" | "credentials"; // e.g., 'Google', 'Credential', etc.
  providerId: string;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  profileImage?: string;
  isDeleted?: string;
  auths: IAuthProvider[];
  privatePin?: string;
  storageUsed: number;
  pinFailedAttempts: number;
  pinLockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
