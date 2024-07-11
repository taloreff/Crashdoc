const mongoose = require('mongoose');
const caseSchema = require('./caseModel').schema;

const guestSchema = new mongoose.Schema(
    {
        cases: { type: [caseSchema], default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Guest', guestSchema);
