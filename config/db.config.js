module.exports = {
  HOST: "localhost",
  USER: "arnavgupta",
  PASSWORD: "",
  DB: "digiiq",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
