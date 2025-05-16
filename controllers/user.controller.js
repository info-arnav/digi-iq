const db = require("../models");
const generator = require("./components/generator");
const User = db.users;
const { fn, col, where } = db.Sequelize;

exports.create = async (email, password) => {
  if (!email || !password) {
    return { error: true, message: "Email and Password are required" };
  }

  const user = {
    email: email,
    password: password,
  };

  return await generator(User, user);
};

exports.findOne = async (email) => {
  if (!email) {
    return { error: true, message: "Email is required" };
  }

  const query = {
    where: where(fn("LOWER", col("email")), "=", email.toLowerCase()),
  };

  return await User.findOne(query)
    .then((data) => {
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

exports.findById = async (user_id) => {
  if (!user_id) {
    return { error: true, message: "User Id is required" };
  }

  const query = {
    where: { user_id: user_id },
  };

  return await User.findOne(query)
    .then((data) => {
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

exports.update = async (user_id, changes) => {
  if (!user_id || !changes) {
    return { error: true, message: "User ID and changes are required" };
  }

  console.log(user_id, changes);

  const query = {
    where: {
      user_id: user_id,
    },
  };

  try {
    await User.update(changes, query);
    return { error: false, message: "User updated successfully" };
  } catch (err) {
    return {
      error: true,
      message: err,
    };
  }
};
