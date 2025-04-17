const queProcessor = require("../cron_jobs/que_processor");
const connect = require("./connect");

const middleware = async (req, res, next) => {
  let conn_db = await connect();

  if (conn_db.error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: `Connection to database failed, please check console for further details.`,
      status: 500,
    });
  }

  req.db = conn_db.conn;

  //Cron Jobs
  queProcessor(req.db);

  next();
};

module.exports = middleware;
