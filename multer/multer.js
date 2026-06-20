import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createMulterUploader = (folderName) => {
  const uploadDir = path.join(__dirname, "..", "uploads", folderName);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure directory exists before writing (safe across all build systems)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, crypto.randomUUID() + ext);
    },
  });

  function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }

  return multer({ storage, fileFilter });
};

export const uploadSingleFile = (fieldName, folderName) => {
  return createMulterUploader(folderName).single(fieldName);
};

export const uploadMultipleFiles = (arrayOfFields, folderName) => {
  return createMulterUploader(folderName).fields(arrayOfFields);
};
