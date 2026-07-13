import { Athletes } from "./Athletes.js";
import { Fees } from "./Fees.js";

Athletes.hasMany(Fees, {
  foreignKey: "athleteId",
  as: "fees",
});

Fees.belongsTo(Athletes, {
  foreignKey: "athleteId",
  as: "athlete",
});
