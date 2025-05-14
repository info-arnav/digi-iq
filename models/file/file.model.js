module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define(
    "file",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.BLOB("long"),
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return File;
};
