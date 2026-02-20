import { IFolder } from "./folder.interface";
import { Folder } from "./folder.model";


const createFolder = async (payload: Partial<IFolder>) => {
    const { name, userId } = payload;
  const folder = await Folder.create({ name, userId });
  return folder;
};


export const FolderService = {
  createFolder,
};