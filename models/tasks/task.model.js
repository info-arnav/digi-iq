module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define(
    "task",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
      },
      model_type: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      prompt: {
        type: Sequelize.STRING,
      },
      files: {
        type: Sequelize.UUID,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    },
    { timestamps: true }
  );

  return Task;
};
