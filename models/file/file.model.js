module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define(
    "file",
    {
      file_id: {
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
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
      },
      total_chunks: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return File;
};
