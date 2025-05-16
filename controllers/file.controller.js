const db = require("../models");
const generator = require("./components/generator");
const File = db.files;
const Chunk = db.chunks;

const findNullsTillIndex = (arr, idx) =>
  arr
    .slice(0, idx + 1)
    .map((v, i) => {
      return v == null ? i : -1;
    })
    .filter((i) => i !== -1);

exports.create = async (
  user_id,
  mime_type,
  total_chunks,
  buffer,
  chunk_num
) => {
  if (
    !user_id ||
    !mime_type ||
    !buffer ||
    typeof total_chunks != "number" ||
    typeof chunk_num != "number"
  ) {
    return { error: true, message: "Suitable data not provided" };
  }

  const chunksArray = new Array(total_chunks).fill(null);

  const file = {
    user_id: user_id,
    mime_type: mime_type,
    data: chunksArray,
    total_chunks: total_chunks,
  };

  const generatedFile = await generator(File, file);

  if (generatedFile.error) {
    return generatedFile;
  }

  return this.update(user_id, buffer, chunk_num, generatedFile.data.file_id);
};

exports.update = async (user_id, buffer, chunk_num, file_id) => {
  if (!user_id || !buffer || !file_id || typeof chunk_num != "number") {
    return { error: true, message: "Suitable data not provided" };
  }

  const file = await File.findOne({
    where: {
      user_id: user_id,
      file_id: file_id,
    },
  });

  if (file == null) {
    return { error: true, message: "Unauthorized" };
  }

  if (file.data[chunk_num] != null) {
    return { error: true, message: "Chunk already stored" };
  }

  const chunk = {
    file_id: file_id,
    data: buffer,
  };

  const generatedChunk = await generator(Chunk, chunk);

  if (generatedChunk.error) {
    return generatedChunk;
  }

  const updatedArray = [...file.data];
  updatedArray[chunk_num] = generatedChunk.data.chunk_id;
  file.data = updatedArray;

  let missing_chunks = findNullsTillIndex(updatedArray, chunk_num);

  await file.save();

  return {
    error: false,
    message: "File updated",
    updated_chunk: chunk_num,
    file_id: file_id,
    missing_chunks: missing_chunks,
  };
};
