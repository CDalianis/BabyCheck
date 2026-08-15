import fs from "fs";
import type { Request } from "express";
import multer from "multer";
import path from "path";
import { BABY_PHOTOS_DIR } from "../config/paths.js";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024;

if (!fs.existsSync(BABY_PHOTOS_DIR)) {
  fs.mkdirSync(BABY_PHOTOS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, BABY_PHOTOS_DIR);
  },
  filename: (req, file, cb) => {
    const babyId = req.params.id;
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${babyId}${ext}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
  }
  cb(null, true);
}

export const babyPhotoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES },
});
