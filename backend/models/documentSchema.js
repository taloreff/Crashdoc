const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    driversLicense: { type: String, default: "" },
    vehicleLicense: { type: String, default: "" },
    insurance: { type: String, default: "" },
    registration: { type: String, default: "" },
    additionalDocuments: { type: String, default: "" }
});

module.exports = documentSchema;
