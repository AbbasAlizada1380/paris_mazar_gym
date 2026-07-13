import { Fees } from "../Models/Fees.js";
import { Athletes } from "../Models/Athletes.js";
import { Op } from "sequelize";
export const searchFeesByAthlete = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build search conditions for Athlete model
    const athleteSearchConditions = {
      [Op.or]: [
        {
          full_name: {
            [Op.like]: `%${query}%`
          }
        },
        {
          father_name: {
            [Op.like]: `%${query}%`
          }
        },
        {
          nic_number: {
            [Op.like]: `%${query}%`
          }
        }
      ]
    };

    // First, find athletes that match the search criteria
    const matchingAthletes = await Athletes.findAll({
      where: athleteSearchConditions,
      attributes: ['id'],
      raw: true
    });

    // Extract athlete IDs
    const athleteIds = matchingAthletes.map(athlete => athlete.id);

    // If no athletes found, return empty result
    if (athleteIds.length === 0) {
      return res.status(200).json({
        message: "No fees found for athletes matching your search criteria",
        data: [],
        meta: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          searchQuery: query,
        }
      });
    }

    // Now find fees for these athletes
    const { rows: fees, count: totalItems } = await Fees.findAndCountAll({
      where: {
        athleteId: {
          [Op.in]: athleteIds
        }
      },
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "father_name", "nic_number", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      message: "Search completed successfully",
      data: fees,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        searchQuery: query,
        matchingAthletesCount: athleteIds.length,
      }
    });
  } catch (error) {
    console.error("Search fees error:", error);
    res.status(500).json({
      message: "Error searching fees",
      error: error.message,
    });
  }
};
export const getActiveFeesToday = async (req, res) => {
  try {
    const today = new Date();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: fees, count: totalItems } = await Fees.findAndCountAll({
      where: {
        isactive: true, // ⬅️ added this condition
        startDate: { [Op.lte]: today },
        endDate: { [Op.gte]: today },
      },
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "nic_number", "photo"],
        },
      ],
      order: [["startDate", "ASC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: fees,
      currentPage: page,
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching active fees",
      error: error.message,
    });
  }
};


export const getFeesInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    // Set start to beginning of day
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    // Set end to end of day (23:59:59.999)
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const fees = await Fees.findAll({
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "nic_number"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching fees in range",
      error: error.message,
    });
  }
};

/**
 * @desc   Create new fee
 * @route  POST /api/fees
 */
/**
 * @desc   Create new fee
 * @route  POST /api/fees
 */
export const createFee = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      total,
      received,
      athleteId,
      cabinate_num,
      has_cabinate,
    } = req.body;

    // Required fields validation
    if (!startDate || !endDate || !total || !athleteId) {
      return res.status(400).json({
        message: "startDate, endDate, total and athleteId are required",
      });
    }

    // Validate cabinate_num if has_cabinate is true
    if (has_cabinate && !cabinate_num) {
      return res.status(400).json({
        message: "cabinate_num is required when has_cabinate is true",
      });
    }

    // Check athlete exists
    const athlete = await Athletes.findByPk(athleteId);
    if (!athlete) {
      return res.status(404).json({
        message: "Athlete not found",
      });
    }

    // Build fee data
    const feeData = {
      startDate,
      endDate,
      total,
      received: received || 0,
      athleteId,
      has_cabinate: has_cabinate || false,
      cabinate_num: has_cabinate ? (cabinate_num || null) : null,
    };

    const fee = await Fees.create(feeData);

    res.status(201).json({
      message: "Fee created successfully",
      fee,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "NIC number already exists",
      });
    }
    res.status(500).json({
      message: "Error creating fee",
      error: error.message,
    });
  }
};

/**
 * @desc   Get all fees
 * @route  GET /api/fees
 */
export const getAllFees = async (req, res) => {
  try {
    // query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // query with pagination
    const { rows: fees, count: totalItems } = await Fees.findAndCountAll({
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "nic_number"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: fees,
      currentPage: page,
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching fees",
      error: error.message,
    });
  }
};


/**
 * @desc   Get fee by ID
 * @route  GET /api/fees/:id
 */
export const getFeeById = async (req, res) => {
    try {
        const fee = await Fees.findByPk(req.params.id, {
            include: [
                {
                    model: Athlete,
                    as: "athlete",
                    attributes: ["id", "full_name", "nic_number"],
                },
            ],
        });

        if (!fee) {
            return res.status(404).json({
                message: "Fee not found",
            });
        }

        res.status(200).json(fee);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching fee",
            error: error.message,
        });
    }
};

/**
 * @desc   Update fee
 * @route  PUT /api/fees/:id
 */
export const updateFee = async (req, res) => {
  try {
    const fee = await Fees.findByPk(req.params.id);

    if (!fee) {
      return res.status(404).json({
        message: "Fee not found",
      });
    }

    // ─── Recalculate remained if total or received is being updated ───
    const { total, received } = req.body;
    if (total !== undefined || received !== undefined) {
      const newTotal = total !== undefined ? Number(total) : fee.total;
      const newReceived = received !== undefined ? Number(received) : fee.received;
      req.body.remained = newTotal - newReceived;
    }

    await fee.update(req.body);

    res.status(200).json({
      message: "Fee updated successfully",
      fee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating fee",
      error: error.message,
    });
  }
};

/**
 * @desc   Delete fee
 * @route  DELETE /api/fees/:id
 */
export const deleteFee = async (req, res) => {
    try {
        const fee = await Fees.findByPk(req.params.id);

        if (!fee) {
            return res.status(404).json({
                message: "Fee not found",
            });
        }

        await fee.destroy();

        res.status(200).json({
            message: "Fee deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting fee",
            error: error.message,
        });
    }
};

export const updateFeeActiveStatus = async (req, res) => {
  try {
    const { id } = req.params; // optional
    const where = id ? { id } : {};

    const fees = await Fees.findAll({ where });
    if (fees.length === 0) {
      return res.status(404).json({
        message: id ? "Fee not found" : "No fees found to update",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of day

    const updates = fees.map(async (fee) => {
      const start = new Date(fee.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(fee.endDate);
      end.setHours(0, 0, 0, 0);

      const isActive = (today >= start && today <= end);

      // Only update if status would change
      if (fee.isactive !== isActive) {
        await fee.update({ isactive: isActive });
        return { id: fee.id, isactive: isActive, status: "updated" };
      }
      return { id: fee.id, isactive: fee.isactive, status: "unchanged" };
    });

    const results = await Promise.all(updates);

    res.status(200).json({
      message: `Checked ${results.length} fee(s)`,
      results,
    });
  } catch (error) {
    console.error("Update active status error:", error);
    res.status(500).json({
      message: "Error updating fee active status",
      error: error.message,
    });
  }
};
/**
 * @desc   Get all paid fees for a specific athlete
 * @route  GET /api/fees/athlete/:athleteId/paid
 */
export const getPaidFeesByAthlete = async (req, res) => {
  try {
    const { athleteId } = req.params;

    if (!athleteId) {
      return res.status(400).json({ message: "athleteId is required" });
    }

    // Check if athlete exists (optional, but good practice)
    const athlete = await Athletes.findByPk(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    // Pagination (optional)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query fees: match athleteId AND remained = 0
    const { rows: fees, count: totalItems } = await Fees.findAndCountAll({
      where: {
        athleteId: athleteId,
      },
      include: [
        {
          model: Athletes,
          as: "athlete",
          attributes: ["id", "full_name", "nic_number", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      message: "Paid fees retrieved successfully",
      data: fees,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        athleteId,
      },
    });
  } catch (error) {
    console.error("Error fetching paid fees:", error);
    res.status(500).json({
      message: "Error fetching paid fees",
      error: error.message,
    });
  }
};


Athletes.hasMany(Fees, {
    foreignKey: "athleteId",
    as: "fees",
});

Fees.belongsTo(Athletes, {
    foreignKey: "athleteId",
    as: "athlete",
});
