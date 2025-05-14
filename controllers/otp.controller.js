const db = require("../models");
const Otp = db.otps;
const { fn, col, where } = db.Sequelize;

exports.create = async (email, otp) => {
  try {
    const user = await Otp.upsert(
      {
        email: email.toLowerCase(),
        code: otp,
        expires_at: new Date(Date.now() + 1000 * 60 * 30),
      },
      {
        returning: true,
        conflictFields: ["email"],
      }
    );

    return {
      error: false,
      data: user,
    };
  } catch (err) {
    return {
      error: true,
      message: err.message || "Some error occurred while upserting the OTP.",
    };
  }
};

exports.find = async (email) => {
  if (!email) {
    res.status(400).send({
      message: "Email is required",
    });
    return;
  }

  const query = {
    where: where(fn("LOWER", col("email")), "=", email.toLowerCase()),
  };

  return await Otp.findOne(query)
    .then((data) => {
      if (data.expires_at < new Date()) {
        return {
          error: true,
          message: "OTP Expired",
        };
      }
      return { error: false, data: data };
    })
    .catch((err) => {
      return {
        error: true,
        message:
          err.message || "Some error occurred while searching for the User.",
      };
    });
};
