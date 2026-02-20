import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";

const getAnalytics = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.user as { userId: string };
    const analytics = await AnalyticsService.getAnalytics(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Analytics retrieved successfully",
      data: analytics,
    });
  },
);

export const AnalyticsController = {
  getAnalytics,
};
