import  httpStatus  from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { FolderService } from './folder.service';
import { sendResponse } from '../../utils/sendResponse';
import { Types } from 'mongoose';



const createFolder = catchAsync(
  async (req: Request, res: Response) => {
    const {userId} = req.user as { userId: string };
    
    const { name } = req.body;
    const folder = await FolderService.createFolder({ name, userId: new Types.ObjectId(userId) });

    console.log(userId)

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Folder created successfully",
      data: folder,
    });
  },
);


export const FolderController = {
  createFolder,
};