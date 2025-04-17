const cron = require("node-cron");
const connect = require("../db/connect");
const { ObjectId } = require("mongodb");

const JOB_LIMIT = 10;

let current_processes = 0;
let requests = [];

let db;

const job = async () => {
  if (current_processes < JOB_LIMIT) {
    requests = await db
      .db("digiIQ")
      .collection("requests")
      .find(
        {
          status: "qued",
        },
        {
          sort: { createdAt: 1 },
          projection: {
            user_data: 1,
            _id: 1,
          },
        }
      )
      .limit(JOB_LIMIT - current_processes)
      .toArray();
  }
  requests.map(async (req) => {
    await db
      .db("digiIQ")
      .collection("requests")
      .findOneAndUpdate(
        {
          _id: ObjectId(req._id),
        },
        {
          status: "processing",
        }
      );
    fetch()
      .then(
        async () =>
          await db
            .db("digiIQ")
            .collection("requests")
            .findOneAndUpdate(
              {
                _id: ObjectId(req._id),
              },
              {
                status: "processed",
              }
            )
      )
      .then((e) => {
        current_processes = current_processes - 1;
        job();
      });
    current_processes = current_processes + 1;
  });
};

const queProcessor = async (database) => {
  db = database;
  cron.schedule("*/100 * * * * *", job);
};

module.exports = queProcessor;
