const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  name: String,
  description: String,
  models: [
    {
      name: String,
      format: String,
      size: String,
      cloudinaryUrl: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Experience", experienceSchema);