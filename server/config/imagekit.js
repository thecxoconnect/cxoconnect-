import ImageKit from 'imagekit';

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || '';
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';

let imagekitInstance = null;

if (publicKey && privateKey && urlEndpoint) {
  try {
    imagekitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint
    });
    console.log('[ImageKit] SDK initialized successfully with endpoint:', urlEndpoint);
  } catch (err) {
    console.error('[ImageKit Error] Failed to initialize ImageKit SDK:', err.message);
  }
} else {
  console.warn('[ImageKit Warning] ImageKit credentials missing. Local upload fallback will be used.');
}

/**
 * Upload a file buffer to ImageKit
 * @param {Buffer} fileBuffer
 * @param {string} fileName
 * @param {string} folder
 * @returns {Promise<{url: string, fileId: string}>}
 */
export const uploadFileToImageKit = async (fileBuffer, fileName, folder = '/cxoconnect/') => {
  if (!imagekitInstance) {
    // Fallback data URL if ImageKit is unconfigured
    const base64 = fileBuffer.toString('base64');
    return {
      url: `data:image/jpeg;base64,${base64}`,
      fileId: `local_${Date.now()}`
    };
  }

  const response = await imagekitInstance.upload({
    file: fileBuffer,
    fileName: `${fileName}_${Date.now()}.jpg`,
    folder
  });

  return {
    url: response.url,
    fileId: response.fileId
  };
};

/**
 * Delete a file from ImageKit by fileId
 * @param {string} fileId
 */
export const deleteFileFromImageKit = async (fileId) => {
  if (!imagekitInstance || !fileId || fileId.startsWith('local_')) return;
  try {
    await imagekitInstance.deleteFile(fileId);
  } catch (err) {
    console.warn(`[ImageKit Warning] Could not delete file ${fileId}:`, err.message);
  }
};

export default imagekitInstance;
