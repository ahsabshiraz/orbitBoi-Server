const Experience = require("../models/Experience");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const createExperience = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const newExperience = new Experience({
      name:req.body.n,
      description,
      user: req.user.id,
      models: []
    });
    const savedExperience = await newExperience.save();
    res.status(201).json(savedExperience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create experience" });
  }
};

const uploadModelToExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      folder: "3d-models",
    });
    fs.unlinkSync(file.path);

    const modelData = {
      name: result.original_filename,
      format: file.originalname.split('.').pop(),
      size: `${(result.bytes / 1024 / 1024).toFixed(2)} MB`,
      cloudinaryUrl: result.secure_url,
    };

    const updatedExperience = await Experience.findOneAndUpdate(
      { _id: experienceId, user: req.user.id },
      { $push: { models: modelData } },
      { new: true }
    );
    if (!updatedExperience) return res.status(404).json({ error: "Experience not found" });
    res.status(201).json(updatedExperience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload model to experience" });
  }
};

const getUserExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
};

const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findOne({ _id: req.params.id, user: req.user.id });
    if (!experience) return res.status(404).json({ error: "Experience not found" });
    res.json(experience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch experience" });
  }
};

module.exports = { createExperience, uploadModelToExperience, getUserExperiences, getExperienceById }; 