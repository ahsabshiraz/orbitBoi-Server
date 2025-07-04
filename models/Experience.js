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
  sceneData: {
    camera: {
      position: { type: Object, default: {} },
      lookAt: { type: Object, default: {} },
      controls: { type: Object, default: {} }
    },
    environment: {
      exposure: { type: Number, default: 1 },
      env: { type: Boolean, default: false },
      backgroundColor: { type: String, default: "#ffffff" }
    },
    fog: {
      enabled: { type: Boolean, default: false },
      min: { type: Number, default: 10 },
      max: { type: Number, default: 100 }
    },
    modelPositions: { type: Object, default: {} }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Experience", experienceSchema);