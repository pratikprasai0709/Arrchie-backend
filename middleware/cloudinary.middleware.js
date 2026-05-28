import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

export const uploadToCloudinary = async (req, res, next) => {
  // Ensure environment variables are loaded and Cloudinary is configured
  dotenv.config();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Support both single file (req.file) and multiple files (req.files)
  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    return next();
  }

  try {
    const cloudinaryUrls = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'arrchie_products'
      });
      cloudinaryUrls.push(result.secure_url);
      
      // Delete local temp file asynchronously
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Failed to delete local temp file:", err);
        }
      });
    }
    
    // Attach results to req object
    req.cloudinaryUrls = cloudinaryUrls;
    if (cloudinaryUrls.length > 0) {
      // For backwards compatibility, attach the first URL to req.file.cloudinaryUrl
      if (!req.file) req.file = {};
      req.file.cloudinaryUrl = cloudinaryUrls[0];
    }

    next();
  } catch (error) {
    console.error("Cloudinary Upload Error Details:", error);
    // Attempt to clean up all uploaded temp files on error
    for (const file of files) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Failed to delete local temp file on error:", err);
        }
      });
    }
    return res.status(500).json({ message: 'Error uploading images to Cloudinary', error: error.message });
  }
};
