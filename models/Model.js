const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  name: String,
  format: String,
  size: String,
  cloudinaryUrl: String,
  uploadedAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model("Model", modelSchema);
