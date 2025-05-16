const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const sessions = require("../../controllers/session.controller.js");
const files = require("../../controllers/file.controller.js");

router.post("/", upload.single("file"), async (req, res) => {
  if (
    !req.file ||
    !req.body.access_token ||
    !req.body.fingerprint ||
    !req.body.chunk_num ||
    !req.body.total_chunks
  ) {
    return res.status(401).json({
      err: true,
      code: 401,
      message: "Required credentials not provided",
    });
  }

  const { originalname, mimetype, buffer } = req.file;
  let { fingerprint, access_token, chunk_num, total_chunks } = req.body;

  let data = await sessions.validateAccessToken(access_token, fingerprint);

  if (data.error || data.expired) {
    return res.status(400).json({ error: true, message: "Access Denied" });
  }

  chunk_num = parseInt(chunk_num);
  total_chunks = parseInt(total_chunks);

  if (
    chunk_num > total_chunks ||
    chunk_num < 0 ||
    isNaN(chunk_num) ||
    isNaN(total_chunks)
  ) {
    return res.status(500).json({ message: "Invalid chunk number." });
  }

  let fileData;

  if (chunk_num == 0) {
    fileData = await files.create(
      data.user_id,
      mimetype,
      total_chunks,
      buffer,
      chunk_num
    );
  } else {
    if (!req.body.file_id) {
      return res.status(401).json({
        err: true,
        code: 401,
        message: "Required credentials not provided",
      });
    }
    const { file_id } = req.body;
    fileData = await files.update(data.user_id, buffer, chunk_num, file_id);
  }

  if (fileData.error) {
    return res.status(500).json(fileData);
  }

  return res.status(200).json(fileData);
});

module.exports = router;
