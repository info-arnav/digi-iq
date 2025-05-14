const db = require("../models");
const generator = require("./components/generator");
const File = db.files;

exports.create = async (user_id, mime_type, data) => {
  if (!user_id || !mime_type || !data) {
    return { error: true, message: "Suitable data not provided" };
  }

  const file = {
    user_id: user_id,
    mime_type: mime_type,
    data: data,
  };

  const generatedData = await generator(File, file);

  return generatedData;
};
