const db = require("../models");
const generator = require("./components/generator");
const Session = db.sessions;
const { col, where, Op } = db.Sequelize;

exports.create = async (email, fingerprint, user_id) => {
  if (!email || !fingerprint || !user_id) {
    return { error: true, message: "Credentials are required" };
  }

  const session = {
    email: email,
    fingerprint: fingerprint,
    user_id: user_id,
  };

  const data = await generator(Session, session);
  const raw = data.data?.get?.({ plain: true }) || data.data;
  delete raw.fingerprint;

  data.data = raw;

  return data;
};

exports.delete = async (refresh_token, fingerprint) => {
  if (!refresh_token || !fingerprint) {
    return { error: true, message: "Email and Fingerprint are required" };
  }

  const query = {
    where: {
      [Op.and]: [
        where(col("refresh_token"), "=", refresh_token),
        where(col("fingerprint"), "=", fingerprint),
      ],
    },
  };

  return await Session.destroy(query)
    .then(() => {
      return { error: false };
    })
    .catch((err) => {
      return { error: true, message: err };
    });
};

exports.validateAccessToken = async (access_token, fingerprint) => {
  if (!access_token) {
    return { error: true, message: "Some details are missing" };
  }

  const query = {
    where: {
      [Op.and]: [
        where(col("access_token"), "=", access_token),
        where(col("fingerprint"), "=", fingerprint),
      ],
    },
  };

  return await Session.findOne(query)
    .then((data) => {
      if (data == null) {
        return { error: true, exists: false };
      } else if (data.access_token_expires_at < new Date()) {
        return { error: false, exists: true, expired: true };
      }
      return {
        error: false,
        exists: true,
        expired: false,
        user_id: data.user_id,
      };
    })
    .catch((err) => {
      return {
        error: true,
        message:
          err.message || "Some error occurred while searching for the Token.",
      };
    });
};

exports.updateAccessToken = async (refresh_token, fingerprint) => {
  if (!refresh_token || !fingerprint) {
    return { error: true, message: "Some details are missing" };
  }

  const query = {
    where: {
      [Op.and]: [
        where(col("refresh_token"), "=", refresh_token),
        where(col("fingerprint"), "=", fingerprint),
      ],
    },
  };

  return await Session.findOne(query)
    .then(async (data) => {
      if (data == null) {
        return { error: true, exists: false };
      } else if (data.refresh_token_expires_at < new Date()) {
        return { error: true, exists: true, expired: true };
      }

      const deleteData = this.delete(refresh_token, fingerprint);

      if (deleteData.error) {
        return deleteData;
      }

      return this.create(data.email, fingerprint, data.user_id);
    })
    .catch((err) => {
      return {
        error: true,
        message: err.message || "Some error occurred while updating the Token.",
      };
    });
};
