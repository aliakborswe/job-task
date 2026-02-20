import httpStatus from "http-status";
import { envVars } from "../../config/env";
import AppError from "../../utils/AppError";
import { AnalyticsData, CategoryStats } from "./analytics.interface";
import { User } from "../user/user.model";
import { Folder } from "../folder/folder.model";
import { File } from "../file/file.model";

const getAnalytics = async (userId: string): Promise<AnalyticsData> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const maxStorage = parseInt(envVars.MAX_STORAGE_BYTES);

  const [folderStats, noteStats, imageStats, pdfStats, recentUploads] =
    await Promise.all([
      Folder.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalSize: { $sum: "$storageUsed" },
          },
        },
      ]),

      File.aggregate([
        { $match: { userId: user._id, type: "note" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalSize: { $sum: "$size" },
          },
        },
      ]),

      File.aggregate([
        { $match: { userId: user._id, type: "image" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalSize: { $sum: "$size" },
          },
        },
      ]),

      File.aggregate([
        { $match: { userId: user._id, type: "pdf" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalSize: { $sum: "$size" },
          },
        },
      ]),

      File.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name type size createdAt")
        .lean(),
    ]);

  const extractStats = (result: Record<string, number>[]): CategoryStats => ({
    count: result[0]?.count || 0,
    totalSize: result[0]?.totalSize || 0,
  });

  return {
    storage: {
      total: maxStorage,
      used: user.storageUsed,
      remaining: Math.max(0, maxStorage - user.storageUsed),
      usedPercentage: parseFloat(
        ((user.storageUsed / maxStorage) * 100).toFixed(2),
      ),
    },
    folders: {
      count: folderStats[0]?.count || 0,
      totalSize: folderStats[0]?.totalSize || 0,
    },
    notes: extractStats(noteStats),
    images: extractStats(imageStats),
    pdfs: extractStats(pdfStats),
    recentUploads: recentUploads.map((f) => ({
      _id: String(f._id),
      name: f.name,
      type: f.type,
      size: f.size,
      createdAt: f.createdAt,
    })),
  };
};

export const AnalyticsService = {
  getAnalytics,
};
