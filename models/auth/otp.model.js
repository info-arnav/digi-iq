module.exports = (sequelize, Sequelize) => {
  const Otp = sequelize.define(
    "otp",
    {
      email: {
        primaryKey: true,
        type: Sequelize.STRING,
        unique: true,
        validate: { isEmail: true },
      },
      code: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 1000 * 60 * 30),
      },
    },
    { timestamps: true }
  );

  return Otp;
};
