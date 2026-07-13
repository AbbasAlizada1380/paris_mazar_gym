import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure folders exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "document_pdf") {
      const dir = "uploads/documents";
      createDir(dir);
      cb(null, dir);
    } else if (file.fieldname === "photo") {
      const dir = "uploads/photos";
      createDir(dir);
      cb(null, dir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

export const uploadAthleteFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
