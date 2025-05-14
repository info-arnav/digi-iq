const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const users = require("../../controllers/user.controller.js");
const otps = require("../../controllers/otp.controller.js");
const mailer = require("../../mail/transporter.js");
const sessions = require("../../controllers/session.controller.js");

router.post("/", async (req, res) => {
  if ((!req.body.email, !req.body.password, !req.body.fingerprint)) {
    return res.status(401).json({
      err: true,
      code: 400,
      message: "Required credentials not provided",
    });
  }

  const { email, password, fingerprint } = req.body;

  let data = await users.findOne(email);
  if (data.error) {
    return res.status(500).json({
      err: true,
      code: 500,
      message: "Internal server error",
    });
  } else if (data.data != null) {
    return res
      .status(400)
      .json({ err: true, message: "User already exists", code: 401 });
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }

  let userResponse = await users.create(email, hashedPassword);

  if (userResponse.error) {
    return res.status(500).json(userResponse);
  }

  const OTP = Math.floor(100000 + Math.random() * 900000);
  const otpResponse = await otps.create(email, OTP);

  if (otpResponse.error) {
    return res.status(500).json(otpResponse);
  }

  const mailResponse = await mailer.sendMail(
    email,
    "OTP to Verify Your Account",
    `Your OTP is ${OTP}`,
    `<p>Your OTP is ${OTP}</p>`
  );

  if (mailResponse.error) {
    return res.status(500).json(otpResponse);
  }

  const sessionData = await sessions.create(email, fingerprint);

  return res.status(sessionData.error ? 500 : 200).json(sessionData);
});

module.exports = router;
