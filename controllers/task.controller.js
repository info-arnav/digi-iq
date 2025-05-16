const db = require("../models");
const generator = require("./components/generator");
const Task = db.tasks;

exports.create = async (user_id, model_type, files, prompt) => {
  if (!user_id || !model_type || !prompt) {
    return { error: true, message: "Suitable data not provided" };
  }

  const task = {
    user_id: user_id,
    model_type: model_type,
    files: files,
    prompt: prompt,
    status: "pending",
  };

  const generatedTask = await generator(Task, task);

  if (generatedTask.error) {
    return generatedTask;
  }

  return generatedTask;
};
