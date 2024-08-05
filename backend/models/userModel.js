const mongoose = require("mongoose");
const onboardingInfoSchema = require("./onboardingInfoSchema");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    cases: { type: Array, default: [] },
    onboardingInfo: { type: onboardingInfoSchema, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
