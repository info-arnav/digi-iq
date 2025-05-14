const express = require("express");
const router = express.Router();

const users = require("../../controllers/user.controller.js");
const otps = require("../../controllers/otp.controller.js");
const mailer = require("../../mail/transporter.js");

router.post("/", async (req, res) => {
  if (!req.body.email) {
    return res.status(401).json({
      err: true,
      code: 400,
      message: "Required credentials not provided",
    });
  }

  const { email } = req.body;
  let userResponse = await users.findOne(email);

  if (userResponse.error) {
    return res.status(500).json(userResponse);
  } else if (userResponse.data == null) {
    return res
      .status(400)
      .json({ err: true, message: "No User exists", code: 401 });
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

  return res
    .status(mailResponse.error ? 500 : 200)
    .json(
      mailResponse.error
        ? mailResponse
        : { error: false, message: "OTP sent to email." }
    );
});

module.exports = router;
