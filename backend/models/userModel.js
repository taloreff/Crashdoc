const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  driversLicense: { type: String, default: "" },
  vehicleLicense: { type: String, default: "" },
  insurance: { type: String, default: "" },
  registration: { type: String, default: "" },
  additionalDocuments: { type: String, default: "" }
});

const onboardingInfoSchema = new mongoose.Schema({
  userId: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  vehicleNumber: { type: String, default: "" },
  licenseNumber: { type: String, default: "" },
  vehicleModel: { type: String, default: "" },
  documents: { type: documentSchema, default: {} }
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    cases: { type: Array, default: [] },
    onboardingInfo: { type: onboardingInfoSchema, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
