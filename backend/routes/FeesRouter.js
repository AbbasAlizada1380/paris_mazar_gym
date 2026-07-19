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
  searchActiveFeesByAthlete,  // ⬅️ new import
  updateFeeActiveStatus,
  getPaidFeesByAthlete,
} from "../Controllers/FeesController.js";

const feesRouter = express.Router();

// ─── Public routes (no :id param) ──────────────────────────
feesRouter.post("/", createFee);
feesRouter.get("/", getAllFees);
feesRouter.get("/active", getActiveFeesToday);

// Search routes
feesRouter.get("/search", searchFeesByAthlete);               // all fees
feesRouter.get("/search/active", searchActiveFeesByAthlete);  // ⬅️ NEW: only active fees

feesRouter.get("/:athleteId/paid", getPaidFeesByAthlete);
feesRouter.get("/update-active", updateFeeActiveStatus);        // all fees
feesRouter.get("/:id/update-active", updateFeeActiveStatus);    // one fee

// Note: keep range after update-active to avoid collision
feesRouter.get("/range*", getFeesInRange);

// ─── Routes with :id parameter (must come last) ────────────
feesRouter.get("/:id", getFeeById);
feesRouter.put("/:id", updateFee);
feesRouter.delete("/:id", deleteFee);

export default feesRouter;