import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorMiddleware";
import {
  uploadImageToCloudflare,
  uploadVideoToCloudflare,
} from "../config/cloudflare";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
  ];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter,
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post(
  "/image",
  protect,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    try {
      const result = await uploadImageToCloudflare(
        req.file.buffer,
        req.file.originalname
      );

      res.json({
        success: true,
        data: {
          url: result.url,
          id: result.id,
          variants: result.variants,
        },
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }
  })
);

// @desc    Upload single video
// @route   POST /api/upload/video
// @access  Private
router.post(
  "/video",
  protect,
  upload.single("video"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    try {
      const result = await uploadVideoToCloudflare(
        req.file.buffer,
        req.file.originalname
      );

      res.json({
        success: true,
        data: {
          url: result.url,
          uid: result.uid,
          thumbnail: result.thumbnail,
          duration: result.duration,
        },
        message: "Video uploaded successfully",
      });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload video",
      });
    }
  })
);

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post(
  "/images",
  protect,
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    try {
      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map((file) =>
        uploadImageToCloudflare(file.buffer, file.originalname)
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        data: {
          urls: results.map((result) => result.url),
          ids: results.map((result) => result.id),
          variants: results.map((result) => result.variants),
        },
        message: "Images uploaded successfully",
      });
    } catch (error) {
      console.error("Images upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload images",
      });
    }
  })
);

// @desc    Upload multiple media files (images and videos)
// @route   POST /api/upload/media
// @access  Private
router.post(
  "/media",
  protect,
  upload.array("media", 10),
  asyncHandler(async (req, res) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No media files provided",
      });
    }

    try {
      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map(async (file) => {
        const isVideo = file.mimetype.startsWith("video/");

        if (isVideo) {
          const result = await uploadVideoToCloudflare(
            file.buffer,
            file.originalname
          );
          return {
            type: "video",
            url: result.url,
            uid: result.uid,
            thumbnail: result.thumbnail,
            duration: result.duration,
          };
        } else {
          const result = await uploadImageToCloudflare(
            file.buffer,
            file.originalname
          );
          return {
            type: "image",
            url: result.url,
            id: result.id,
            variants: result.variants,
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        data: {
          media: results,
        },
        message: "Media files uploaded successfully",
      });
    } catch (error) {
      console.error("Media upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload media files",
      });
    }
  })
);

export default router;
