module.exports = (sequelize, Sequelize) => {
  const Session = sequelize.define(
    "session",
    {
      access_token: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      refresh_token: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      fingerprint: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      refresh_token_expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      },
      access_token_expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 1000 * 60 * 30),
      },
    },
    { timestamps: true }
  );

  return Session;
};
