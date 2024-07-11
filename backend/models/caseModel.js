const mongoose = require('mongoose');
const onboardingInfoSchema = require('./onboardingInfoSchema');

const caseSchema = new mongoose.Schema(
  {
    userInfo: { type: onboardingInfoSchema, required: true },
    thirdPartyId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    documents: { type: Array, default: [] },
    damagePhotos: { type: Array, default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Case', caseSchema);
