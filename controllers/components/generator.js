const { UniqueConstraintError } = require("sequelize");

const generator = async (DB, item) => {
  const max_runs = 3;
  let run = 0;

  const generate = async () => {
    run = run + 1;
    return await DB.create(item)
      .then((data) => {
        return { error: false, data: data };
      })
      .catch(async (err) => {
        if (err instanceof UniqueConstraintError && run < max_runs) {
          return await generate();
        } else {
          return {
            error: true,
            message:
              err.message || "Some error occurred while creating the session.",
          };
        }
      });
  };

  return generate();
};

module.exports = generator;
