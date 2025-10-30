// Use untyped imports to avoid TS mismatches with library typings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CloudflareImages: any = require("cloudflare-images");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CloudflareStream: any = require("cloudflare-stream");

// Cloudflare configuration
const cloudflareConfig = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
  apiToken: process.env.CLOUDFLARE_API_TOKEN || "",
  imagesDeliveryUrl: process.env.CLOUDFLARE_IMAGES_DELIVERY_URL || "",
  streamDeliveryUrl: process.env.CLOUDFLARE_STREAM_DELIVERY_URL || "",
};

// Initialize Cloudflare Images client
export const cloudflareImages: any = new CloudflareImages({
  accountId: cloudflareConfig.accountId,
  apiToken: cloudflareConfig.apiToken,
});

// Initialize Cloudflare Stream client
export const cloudflareStream: any = new CloudflareStream({
  accountId: cloudflareConfig.accountId,
  apiToken: cloudflareConfig.apiToken,
});

// Helper function to upload image to Cloudflare
export const uploadImageToCloudflare = async (
  file: Buffer,
  filename: string
) => {
  try {
    const upload: any = await cloudflareImages.upload({
      file: file,
      filename: filename,
    });

    return {
      success: true,
      url: `${cloudflareConfig.imagesDeliveryUrl}/${upload.result?.id}`,
      id: upload.result?.id,
      variants: upload.result?.variants,
    };
  } catch (error) {
    console.error("Cloudflare Images upload error:", error);
    throw new Error("Failed to upload image to Cloudflare");
  }
};

// Helper function to upload video to Cloudflare Stream
export const uploadVideoToCloudflare = async (
  file: Buffer,
  filename: string
) => {
  try {
    const upload: any = await cloudflareStream.upload({
      file: file,
      filename: filename,
    });

    return {
      success: true,
      url: `${cloudflareConfig.streamDeliveryUrl}/${upload.result?.uid}`,
      uid: upload.result?.uid,
      thumbnail: upload.result?.thumbnail,
      duration: upload.result?.duration,
    };
  } catch (error) {
    console.error("Cloudflare Stream upload error:", error);
    throw new Error("Failed to upload video to Cloudflare");
  }
};

// Helper function to delete image from Cloudflare
export const deleteImageFromCloudflare = async (imageId: string) => {
  try {
    await cloudflareImages.delete(imageId);
    return { success: true };
  } catch (error) {
    console.error("Cloudflare Images delete error:", error);
    throw new Error("Failed to delete image from Cloudflare");
  }
};

// Helper function to delete video from Cloudflare Stream
export const deleteVideoFromCloudflare = async (videoUid: string) => {
  try {
    await cloudflareStream.delete(videoUid);
    return { success: true };
  } catch (error) {
    console.error("Cloudflare Stream delete error:", error);
    throw new Error("Failed to delete video from Cloudflare");
  }
};

export default cloudflareConfig;


