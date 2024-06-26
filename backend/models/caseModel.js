const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ID_user: { type: String, required: true },
    Phone_number: { type: String, required: true },
    Vehicle_number: { type: String, required: true },
    License_number: { type: String, required: true },
    Vehicle_model: { type: String, required: true },
    documents: { type: Array, default: [] },
    damagePhotos: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
