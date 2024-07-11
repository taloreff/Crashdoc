const mongoose = require('mongoose');
const documentSchema = require('./documentSchema');

const onboardingInfoSchema = new mongoose.Schema({
    userId: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    vehicleNumber: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    vehicleModel: { type: String, default: "" },
    documents: { type: documentSchema, default: {} }
}, { _id: false });

module.exports = onboardingInfoSchema;
