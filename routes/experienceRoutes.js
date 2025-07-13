const express = require("express");
const router = express.Router();
const { createExperience, uploadModelToExperience, getUserExperiences, getExperienceById, getSceneData, updateSceneData, deleteExperience, uploadHdrToExperience, deleteHdrFromExperience } = require("../controllers/experienceController");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const path = require("path");

// Configure multer for different file types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Keep original filename and extension for all files
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post("/", verifyToken, createExperience);
router.post("/:id/models", verifyToken, upload.single("model"), uploadModelToExperience);
router.get("/", verifyToken, getUserExperiences);
router.get("/:id", verifyToken, getExperienceById);
router.get("/:id/scene", verifyToken, getSceneData);
router.put("/:id/scene", verifyToken, updateSceneData);
router.post("/:id/hdr", verifyToken, upload.single("hdr"), uploadHdrToExperience);
router.delete("/:id/hdr", verifyToken, deleteHdrFromExperience);
router.delete("/:id", verifyToken, deleteExperience);

module.exports = router; 