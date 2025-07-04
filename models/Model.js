const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  name: String,
  format: String,
  size: String,
  cloudinaryUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Model", modelSchema);
