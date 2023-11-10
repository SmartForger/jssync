import { FileInfo } from "./types";

type UploadHandler = (data: any) => void;

const UploadManager = () => {
  const files = new Map<string, FileInfo>();
  const handlers = new Map<string, UploadHandler>();

  const addFile = (f: FileInfo) => {
    files.set(f.id, {
      ...f,
      data: [],
    });
  }

  const getFile = (fileId: string) => {
    return files.get(fileId);
  }

  const removeFile = (fileId: string) => {
    files.delete(fileId);
  }

  const addFileData = (fileId: string, data: any) => {
    const fileInfo = files.get(fileId);
    if (fileInfo?.data) {
      fileInfo.data.push(data);
      return fileInfo.data.length;
    }

    return -1;
  }

  const getFileData = (fileId: string, chunkIndex: number) => {
    const fileInfo = files.get(fileId);
    if (fileInfo?.data) {
      return fileInfo.data[chunkIndex] || null;
    }

    return null;
  }

  const addHandler = (fileId: string, handler: UploadHandler) => {
    handlers.set(fileId, handler);
  }

  const getHandler = (fileId: string) => {
    return handlers.get(fileId);
  }

  const removeHandler = (fileId: string) => {
    handlers.delete(fileId);
  }

  return {
    addFile,
    getFile,
    removeFile,
    addFileData,
    getFileData,
    addHandler,
    getHandler,
    removeHandler,
  };
}

export const uploadManager = UploadManager();
