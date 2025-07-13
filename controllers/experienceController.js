const Experience = require("../models/Experience");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const createExperience = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const newExperience = new Experience({
      name,
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

const uploadHdrToExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const file = req.file;
    // Remove destructuring and validation for 'name' from req.body

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Always use the original filename from multer (which includes .hdr extension)
    let name = file.originalname;

    // Check for duplicate names and append a number if needed
    const experience = await Experience.findOne({ _id: experienceId, user: req.user.id });
    if (!experience) return res.status(404).json({ error: "Experience not found" });

    const existingNames = (experience.sceneData?.environment?.hdr?.hrdUrl || []).map(hdr => hdr.name);
    if (existingNames.includes(name)) {
      // Find all names that match the pattern 'name' or 'name (number)'
      const regex = new RegExp(`^${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\s\\((\\d+)\\))?$`);
      const numbers = existingNames
        .map(n => {
          const match = n.match(regex);
          return match && match[2] ? parseInt(match[2], 10) : (match ? 0 : null);
        })
        .filter(n => n !== null);
      let nextNumber = 1;
      while (numbers.includes(nextNumber)) nextNumber++;
      name = `${name} (${nextNumber})`;
    }

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      folder: "hdr-files",
    });
    fs.unlinkSync(file.path);

    const hdrData = {
      name: name,
      cloudinaryUrl: result.secure_url
    };

    const updatedExperience = await Experience.findOneAndUpdate(
      { _id: experienceId, user: req.user.id },
      { $push: { "sceneData.environment.hdr.hrdUrl": hdrData } },
      { new: true }
    );
    if (!updatedExperience) return res.status(404).json({ error: "Experience not found" });
    res.status(201).json(updatedExperience.sceneData.environment.hdr.hrdUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload HDR to experience" });
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

const getSceneData = async (req, res) => {
  try {
    const experience = await Experience.findOne({ _id: req.params.id, user: req.user.id });
    if (!experience) return res.status(404).json({ error: "Experience not found" });
    res.json(experience.sceneData || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scene data" });
  }
};

const updateSceneData = async (req, res) => {
  try {
    const experience = await Experience.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { sceneData: req.body },
      { new: true }
    );
    if (!experience) return res.status(404).json({ error: "Experience not found" });
    res.json(experience.sceneData);
  } catch (err) {
    res.status(500).json({ error: "Failed to update scene data" });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!experience) return res.status(404).json({ error: "Experience not found" });
    res.json({ message: "Experience deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete experience" });
  }
};

const deleteHdrFromExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const { hdrId } = req.body; // Get HDR _id from request body
    
    if (!hdrId) return res.status(400).json({ error: "HDR ID is required" });

    // Find the experience and get the HDR data
    const experience = await Experience.findOne({ _id: experienceId, user: req.user.id });
    if (!experience) return res.status(404).json({ error: "Experience not found" });

    // Find the HDR entry to delete by _id
    const hdrEntry = experience.sceneData?.environment?.hdr?.hrdUrl?.find(hdr => hdr._id.toString() === hdrId);
    if (!hdrEntry) return res.status(404).json({ error: "HDR not found" });

    // Delete from Cloudinary
    try {
      const publicId = hdrEntry.cloudinaryUrl.split('/').pop().split('.')[0]; // Extract public ID from URL
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch (cloudinaryError) {
      console.error("Cloudinary delete error:", cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Remove from database using _id (consistent with finding)
    const updatedExperience = await Experience.findOneAndUpdate(
      { _id: experienceId, user: req.user.id },
      { $pull: { "sceneData.environment.hdr.hrdUrl": { _id: hdrId } } },
      { new: true }
    );

    res.json({ message: "HDR deleted successfully", remainingHdrs: updatedExperience.sceneData.environment.hdr.hrdUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete HDR from experience" });
  }
};

module.exports = {
  createExperience,
  uploadModelToExperience,
  getUserExperiences,
  getExperienceById,
  getSceneData,
  updateSceneData,
  deleteExperience,
  uploadHdrToExperience,
  deleteHdrFromExperience
}; 