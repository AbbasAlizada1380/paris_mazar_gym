import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";

export const Athletes = sequelize.define(
  "Athlete",
  {
    full_name: {
      type: DataTypes.STRING,
      allowNull: false, // required
    },

    father_name: {
      type: DataTypes.STRING,
      allowNull: false, // required
    },

    permanent_residence: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },

    current_residence: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },

    nic_number: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },

    document_pdf: {
      type: DataTypes.STRING,
      allowNull: true, // optional – no file uploaded
    },

    photo: {
      type: DataTypes.STRING,
      allowNull: true, // optional – no photo uploaded
    },
  },
  {
    tableName: "athletes",
    timestamps: true,
  }
);

export default Athletes;