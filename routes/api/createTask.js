const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const sessions = require("../../controllers/session.controller.js");
const users = require("../../controllers/user.controller.js");
const tasks = require("../../controllers/task.controller.js");

router.post("/", async (req, res) => {
  if (
    !req.body.access_token ||
    !req.body.fingerprint ||
    !req.body.model_type ||
    !req.body.prompt
  ) {
    return res.status(401).json({
      err: true,
      code: 401,
      message: "Required credentials not provided",
    });
  }

  const REQ_CREDITS = 0; // a logic to be written

  let { access_token, fingerprint, model_type, prompt } = req.body;
  const files = req.body.files || null;

  let data = await sessions.validateAccessToken(access_token, fingerprint);

  if (data.error || data.expired) {
    return res.status(400).json({ error: true, message: "Access Denied" });
  }

  let user = await users.findById(data.user_id);

  if (user.error) {
    return res.status(500).json(user);
  }

  const rem_credits = user.data.credits - REQ_CREDITS;

  if (rem_credits < 0) {
    return res.status(400).json("Insuffecient Credits");
  }

  let taskData = await tasks.create(
    data.user_id,
    model_type,
    files,
    prompt,
    rem_credits
  );

  if (taskData.error) {
    return res.status(500).json(taskData);
  }

  let userData = await users.update(data.user_id, { credits: rem_credits });

  if (userData.error) {
    return res.status(500).json(userData);
  }

  return res.status(200).json(taskData);
});

module.exports = router;
