const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const Model = require("../models/Model");

const uploadModel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      folder: "3d-models",
    });

    fs.unlinkSync(file.path); // clean up temp file

    const newModel = new Model({
      name: result.original_filename,
      format: file.originalname.split('.').pop(),
      size: `${(result.bytes / 1024 / 1024).toFixed(2)} MB`,
      cloudinaryUrl: result.secure_url,
      user: req.user.id,
    });

    const savedModel = await newModel.save();

    res.status(201).json(savedModel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

const getUserModels = async (req, res) => {
  try {
    const models = await Model.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    res.json(models);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch models" });
  }
};

module.exports = { uploadModel, getUserModels };
