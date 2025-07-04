const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadModel, getUserModels, getModelById} = require("../controllers/modelController");
const verifyToken = require("../middlewares/verifyToken");

const upload = multer({ dest: "uploads/" }); // temp storage

router.post("/upload", verifyToken, upload.single("model"), uploadModel);
router.get("/", verifyToken, getUserModels);
router.get("/:id", verifyToken, getModelById);

module.exports = router;
