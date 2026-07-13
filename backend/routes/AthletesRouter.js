import express from "express";
import {
  createAthlete,
  getAllAthletes,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
  searchAthletes,
} from "../Controllers/AthletesController.js";
import { uploadAthleteFiles } from "../middleware/upload.js";

const athleteRouter = express.Router();

athleteRouter.post(
  "/",
  uploadAthleteFiles.fields([
    { name: "document_pdf", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  createAthlete
);
athleteRouter.get('/search', searchAthletes);
athleteRouter.get("/", getAllAthletes);
athleteRouter.get("/:id", getAthleteById);
athleteRouter.put("/:id", updateAthlete);
athleteRouter.delete("/:id", deleteAthlete);

export default athleteRouter;
