module.exports = (sequelize, Sequelize) => {
  const Chunk = sequelize.define(
    "chunk",
    {
      chunk_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
      },
      file_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      data: {
        type: Sequelize.BLOB("long"),
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return Chunk;
};
