const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadModel } = require("../controllers/modelController");

const upload = multer({ dest: "uploads/" }); // temp storage

router.post("/upload", upload.single("model"), uploadModel);

module.exports = router;
