import fs from "fs";
import path from "path";

export const deleteLocalFile = (filePath: string): void => {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export const copyLocalFile = (sourcePath: string, destPath: string): void => {
  const srcFull = path.resolve(sourcePath);
  const destFull = path.resolve(destPath);
  const destDir = path.dirname(destFull);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(srcFull, destFull);
};

export const getFileSize = (filePath: string): number => {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) return 0;
  const stats = fs.statSync(fullPath);
  return stats.size;
};
