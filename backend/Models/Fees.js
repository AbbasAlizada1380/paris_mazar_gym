import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";
import { Athletes } from "./Athletes.js";

export const Fees = sequelize.define(
  "Fee",
  {
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    received: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    remained: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    athleteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "athletes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    isactive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // ✅ NEW: cabinet number (integer, nullable)
    cabinate_num: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },

    // ✅ NEW: flag indicating if this fee has a cabinet assigned
    has_cabinate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: "fees",
    timestamps: true,

    hooks: {
      beforeValidate: (fee) => {
        fee.remained = Number(fee.total) - Number(fee.received);
      },
    },

    indexes: [
      {
        fields: ["athleteId"],
      },
    ],
  }
);

export default Fees;