const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const sessions = require("../../controllers/session.controller.js");
const files = require("../../controllers/file.controller.js");

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file || !req.body.access_token || !req.body.fingerprint) {
    return res.status(401).json({
      err: true,
      code: 401,
      message: "Required credentials not provided",
    });
  }

  const { originalname, mimetype, buffer } = req.file;
  const { fingerprint, access_token } = req.body;

  let data = await sessions.validateAccessToken(access_token, fingerprint);

  if (data.error || data.expired) {
    return res.status(400).json({ error: true, message: "Access Denied" });
  }

  const fileData = await files.create(data.user_id, mimetype, buffer);

  if (fileData.error) {
    return res.status(500).json(fileData);
  }

  return res.status(200).json(fileData);
});

module.exports = router;
