import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Ensure folders exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Use memory storage to process files with Sharp
const storage = multer.memoryStorage();

export const uploadAthleteFiles = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB original limit
});

// ─── Middleware to process images ──────────────────────────
export const processAthleteImages = async (req, res, next) => {
  try {
    const photoFile = req.files?.photo?.[0];
    const docFile = req.files?.document_pdf?.[0];

    // ─── Process photo ──────────────────────────────────────
    if (photoFile) {
      const photoDir = "uploads/photos";
      createDir(photoDir);
      const uniqueName =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + ".jpg";
      const outputPath = path.join(photoDir, uniqueName);

      try {
        // Attempt to process with safe settings
        await sharp(photoFile.buffer, {
          failOn: 'none',                 // ignore warnings, try to process
          limitInputPixels: 100000000,   // 100 MP (prevents memory errors)
        })
          .resize(800, 800, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 70, progressive: true })
          .toFile(outputPath);

        // Success – store the processed filename
        photoFile.filename = uniqueName;
        photoFile.path = outputPath;
        delete photoFile.buffer;
      } catch (sharpError) {
        console.warn("Sharp processing failed, saving original file", sharpError.message);

        // Fallback: save the original buffer as-is
        const fallbackExt = path.extname(photoFile.originalname) || ".jpg";
        const fallbackName =
          Date.now() + "-" + Math.round(Math.random() * 1e9) + fallbackExt;
        const fallbackPath = path.join(photoDir, fallbackName);
        fs.writeFileSync(fallbackPath, photoFile.buffer);
        photoFile.filename = fallbackName;
        photoFile.path = fallbackPath;
        delete photoFile.buffer;
      }
    }

    // ─── Process document (PDF) ─────────────────────────────
    if (docFile) {
      const docDir = "uploads/documents";
      createDir(docDir);
      const uniqueName =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + ".pdf";
      const outputPath = path.join(docDir, uniqueName);
      fs.writeFileSync(outputPath, docFile.buffer);
      docFile.filename = uniqueName;
      docFile.path = outputPath;
      delete docFile.buffer;
    }

    next();
  } catch (error) {
    console.error("Image processing error:", error);
    // Pass error to Express error handler
    next(error);
  }
};