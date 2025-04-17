const MongoClient = require("mongodb").MongoClient;

const connectionString = process.env.DATABASE_URI || "";

const connect = async () => {
  let conn;

  try {
    const client = new MongoClient(connectionString);
    conn = await client.connect();
  } catch (e) {
    return { error: true };
  }

  return { error: false, conn: conn };
};

module.exports = connect;
