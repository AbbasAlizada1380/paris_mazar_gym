import express from "express";
import {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  getFeesInRange,
  getActiveFeesToday,
  searchFeesByAthlete,
  updateFeeActiveStatus,
  getPaidFeesByAthlete, // ⬅️ new import
} from "../Controllers/FeesController.js";

const feesRouter = express.Router();

// ─── Public routes (no :id param) ──────────────────────────
feesRouter.post("/", createFee);
feesRouter.get("/", getAllFees);
feesRouter.get("/active", getActiveFeesToday);
feesRouter.get("/search", searchFeesByAthlete);

feesRouter.get("/:athleteId/paid", getPaidFeesByAthlete);
// ⬇️ NEW: Update active status – all fees or single fee
feesRouter.get("/update-active", updateFeeActiveStatus);        // all fees
feesRouter.get("/:id/update-active", updateFeeActiveStatus);    // one fee

// Note: keep range after update-active to avoid collision
feesRouter.get("/range*", getFeesInRange);

// ─── Routes with :id parameter (must come last) ────────────
feesRouter.get("/:id", getFeeById);
feesRouter.put("/:id", updateFee);
feesRouter.delete("/:id", deleteFee);

export default feesRouter;