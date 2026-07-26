// src/routes/AthleteRouter.js
import express from "express";
import {
  createAthlete,
  getAllAthletes,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
  searchAthletes,
} from "../Controllers/AthletesController.js";
import { uploadAthleteFiles, processAthleteImages } from "../middleware/upload.js";

const athleteRouter = express.Router();

// ─── Create (POST) ──────────────────────────────────────────
athleteRouter.post(
  "/",
  uploadAthleteFiles.fields([
    { name: "document_pdf", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  processAthleteImages,   // <--- compress images before saving to DB
  createAthlete
);

// ─── Search ──────────────────────────────────────────────────
athleteRouter.get("/search", searchAthletes);

// ─── Get All (paginated) ────────────────────────────────────
athleteRouter.get("/", getAllAthletes);

// ─── Get By ID ──────────────────────────────────────────────
athleteRouter.get("/:id", getAthleteById);

// ─── Update (PUT) ───────────────────────────────────────────
athleteRouter.put(
  "/:id",
  uploadAthleteFiles.fields([
    { name: "document_pdf", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  processAthleteImages,   // <--- compress images before updating
  updateAthlete
);

// ─── Delete ──────────────────────────────────────────────────
athleteRouter.delete("/:id", deleteAthlete);

export default athleteRouter;