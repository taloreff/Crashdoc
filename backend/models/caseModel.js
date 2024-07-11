const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    documents: { type: Array, default: [] },
    damagePhotos: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
