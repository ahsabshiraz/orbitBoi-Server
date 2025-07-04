const express = require("express");
const router = express.Router();
const { createExperience, uploadModelToExperience, getUserExperiences, getExperienceById, getSceneData, updateSceneData } = require("../controllers/experienceController");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/", verifyToken, createExperience);
router.post("/:id/models", verifyToken, upload.single("model"), uploadModelToExperience);
router.get("/", verifyToken, getUserExperiences);
router.get("/:id", verifyToken, getExperienceById);
router.get("/:id/scene", verifyToken, getSceneData);
router.put("/:id/scene", verifyToken, updateSceneData);

module.exports = router; 