const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "uploads");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("chunk"), async (req, res) => {
  req.body.task = "image-gen";

  if (!req.body.access_token) {
    return res
      .status(401)
      .json({ err: true, code: 401, message: "Invalid access token" });
  }

  try {
    const access_list = await req.db
      .db(process.env.DATABASE_NAME)
      .collection("tokens")
      .findOne({ token: req.body.access_token });

    if (!access_list || !access_list.permissions.includes(req.body.task)) {
      return res
        .status(401)
        .json({ err: true, message: "Unauthorized", code: 401 });
    }

    if (
      access_list.limits[req.body.task].used >=
      access_list.limits[req.body.task].limit
    ) {
      return res
        .status(400)
        .json({ err: true, message: "Usage limit reached" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message, error: true });
  }

  const { uploadId, chunkIndex, totalChunks, originalFilename } = req.body;

  if (
    !uploadId ||
    !chunkIndex ||
    !totalChunks ||
    !originalFilename ||
    !req.file
  ) {
    return res.status(400).send("Missing required fields or file");
  }

  let uniqueFilename;

  const userUploadDir = path.join(UPLOAD_DIR);
  fs.mkdirSync(userUploadDir, { recursive: true });

  const chunkPath = path.join(userUploadDir, `part${chunkIndex}`);
  fs.writeFileSync(chunkPath, req.file.buffer);

  const receivedChunks = fs
    .readdirSync(userUploadDir)
    .filter((f) => f.startsWith("part"));

  if (receivedChunks.length === Number(totalChunks)) {
    const finalPath = path.join(userUploadDir, originalFilename);
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < totalChunks; i++) {
      const partPath = path.join(userUploadDir, `part${i}`);
      const data = fs.readFileSync(partPath);
      writeStream.write(data);
    }

    writeStream.end(async () => {
      try {
        const readStream = fs.createReadStream(finalPath);
        const timestamp = Date.now();
        const ext = path.extname(originalFilename);
        const base = path.basename(originalFilename, ext);
        uniqueFilename = `${base}_${timestamp}${ext}`;
        const uploadStream = req.bucket.openUploadStream("uniqueFilename", {
          chunkSizeBytes: 1048576,
        });

        await new Promise((resolve, reject) => {
          readStream
            .pipe(uploadStream)
            .on("error", reject)
            .on("finish", resolve);
        });

        for (let file of receivedChunks) {
          fs.unlinkSync(path.join(userUploadDir, file));
        }
        fs.unlinkSync(finalPath);
        fs.rmSync(userUploadDir, { recursive: true, force: true });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error saving to bucket", error: true });
      }
    });
  }

  try {
    const db = await req.db
      .db(process.env.DATABASE_NAME)
      .collection("requests")
      .insertOne({
        status: "queued",
        createdAt: new Date(),
        prompt: req.body.prompt,
        files: uniqueFilename,
        req_type: req.body.task,
      });

    await req.db
      .db(process.env.DATABASE_NAME)
      .collection("tokens")
      .findOneAndUpdate(
        { token: req.body.access_token },
        {
          $set: {
            [`limits.${req.body.task}.used`]:
              access_list.limits[req.body.task].used + 1,
          },
        }
      );

    return res.json({
      message: "Image request added to queue",
      error: false,
      task_id: db.insertedId.toString(),
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, error: true });
  }
});

module.exports = router;

// curl -X POST http://localhost:3000/api/image-req\
//   -F "uploadId=123abc" \
//   -F "chunkIndex=0" \
//   -F "totalChunks=2" \
//   -F "originalFilename=example.txt" \
//   -F "chunk=@chunk0.txt"

/**
 *
 * requests
 *
 * otps
 *
 *
 *
 */
