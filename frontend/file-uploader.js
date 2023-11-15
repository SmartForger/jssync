const CHUNK_SIZE = 50 * 1024;

export const FileUploader = () => {
  const files = new Map();

  const startUploadingFile = (file) => {
    const suffix = Math.round(Math.random() * 10000);
    const fileId = `${new Date().getTime()}_${suffix}`;
    files.set(fileId, {
      name: file.name,
      id: fileId,
      chunkIndex: 0,
      totalSize: file.size,
      file,
    });

    return fileId;
  };

  const getFileInfo = (fileId) => {
    return files.get(fileId);
  };

  const getChunk = (fileId) => {
    const fileInfo = files.get(fileId);

    if (fileInfo.file) {
      const chunkIndex = fileInfo.chunkIndex;
      return fileInfo.file.slice(
        chunkIndex * CHUNK_SIZE,
        (chunkIndex + 1) * CHUNK_SIZE
      );
    }

    return "";
  };

  const getUploadProgress = (fileId) => {
    const fileInfo = files.get(fileId);
    if (fileInfo && fileInfo.totalSize) {
      const p = (fileInfo.chunkIndex * CHUNK_SIZE * 100) / fileInfo.totalSize;
      return Math.min(p, 100);
    }

    return 0;
  }

  const setChunkIndex = (fileId, chunkIndex) => {
    const fileInfo = files.get(fileId);

    if (fileInfo) {
      fileInfo.chunkIndex = chunkIndex;
      files.set(fileId, fileInfo);
    }
  }

  const removeFile = (fileId) => {
    files.delete(fileId);
  }

  const startReceiving = (fileId, fileName, totalSize) => {
    files.set(fileId, {
      name: fileName,
      id: fileId,
      chunkIndex: 0,
      totalSize,
      receivedSize: 0,
      data: [],
    });
  }

  const receiveChunk = (fileId, data) => {
    const fileInfo = files.get(fileId);
    if (fileInfo) {
      fileInfo.data.push(data);
      fileInfo.receivedSize += data.length;

      if (fileInfo.totalSize > fileInfo.receivedSize) {
        fileInfo.chunkIndex++;
        return true;
      } else {
        fileInfo.chunkIndex = -1;
      }
    }

    return false;
  }

  return {
    startUploadingFile,
    getFileInfo,
    getChunk,
    setChunkIndex,
    getUploadProgress,
    removeFile,
    startReceiving,
    receiveChunk,
  };
};

export const fileUploader = FileUploader();
