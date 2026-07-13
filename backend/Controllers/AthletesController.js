import { Athletes } from "../Models/Athletes.js";
import { Op } from "sequelize";

// ─── SEARCH ──────────────────────────────────────────────────
export const searchAthletes = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const athletes = await Athletes.findAll({
      where: {
        [Op.or]: [
          { full_name: { [Op.like]: `%${query}%` } },
          { father_name: { [Op.like]: `%${query}%` } },
          { nic_number: { [Op.like]: `%${query}%` } },
          { permanent_residence: { [Op.like]: `%${query}%` } },
          { current_residence: { [Op.like]: `%${query}%` } },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: athletes.length
        ? "Search completed successfully"
        : "No athletes found",
      data: athletes,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Error searching athletes",
      error: error.message,
    });
  }
};

// ─── CREATE ──────────────────────────────────────────────────
export const createAthlete = async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      permanent_residence,
      current_residence,
      nic_number,
    } = req.body;

    // Only full_name and father_name are required
    if (!full_name || !father_name) {
      return res.status(400).json({
        message: "full_name and father_name are required.",
      });
    }

    // Get uploaded files (optional)
    const documentFile = req.files?.document_pdf?.[0];
    const photoFile = req.files?.photo?.[0];

    // Build athlete data – optional fields become null if not provided
    const athleteData = {
      full_name,
      father_name,
      permanent_residence: permanent_residence || null,
      current_residence: current_residence || null,
      nic_number: nic_number || null,
      document_pdf: documentFile ? documentFile.filename : null,
      photo: photoFile ? photoFile.filename : null,
    };

    const athlete = await Athletes.create(athleteData);

    res.status(201).json({
      message: "Athlete created successfully",
      athlete,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "NIC number already exists",
      });
    }
    res.status(500).json({
      message: "Error creating athlete",
      error: error.message,
    });
  }
};

// ─── GET ALL (with pagination) ──────────────────────────────
export const getAllAthletes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: athletes, count: totalItems } =
      await Athletes.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

    res.status(200).json({
      data: athletes,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching athletes",
      error: error.message,
    });
  }
};

// ─── GET BY ID ──────────────────────────────────────────────
export const getAthleteById = async (req, res) => {
  try {
    const athlete = await Athletes.findByPk(req.params.id);
    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }
    res.status(200).json(athlete);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching athlete",
      error: error.message,
    });
  }
};

// ─── UPDATE ──────────────────────────────────────────────────
export const updateAthlete = async (req, res) => {
  try {
    const athlete = await Athletes.findByPk(req.params.id);
    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    // Handle file updates (optional)
    const documentFile = req.files?.document_pdf?.[0];
    const photoFile = req.files?.photo?.[0];

    // Build update object from req.body, but only include provided fields
    const updateData = {};
    const allowedFields = [
      "full_name",
      "father_name",
      "permanent_residence",
      "current_residence",
      "nic_number",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field] || null; // if empty string, set to null
      }
    });

    if (documentFile) updateData.document_pdf = documentFile.filename;
    if (photoFile) updateData.photo = photoFile.filename;

    // If no fields to update, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    await athlete.update(updateData);

    // Fetch the updated athlete
    const updatedAthlete = await Athletes.findByPk(req.params.id);

    res.status(200).json({
      message: "Athlete updated successfully",
      athlete: updatedAthlete,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "NIC number already exists",
      });
    }
    res.status(500).json({
      message: "Error updating athlete",
      error: error.message,
    });
  }
};

// ─── DELETE ──────────────────────────────────────────────────
export const deleteAthlete = async (req, res) => {
  try {
    const athlete = await Athletes.findByPk(req.params.id);
    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }
    await athlete.destroy();
    res.status(200).json({ message: "Athlete deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting athlete",
      error: error.message,
    });
  }
};