const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.get("/", async (req, res) => {
  let user_data = JSON.parse(req.body);
  if (!user_data.id) {
    res.json({ error: true, message: "no id provided" });
  }
  try {
    let db = await req.db
      .db("digiIQ")
      .collection("requests")
      .findOne(
        {
          _id: new ObjectId(user_data.id),
        },
        {
          projection: {
            status: 1,
            result: 1,
          },
        }
      );
  } catch (err) {
    res.json({ message: err, error: true });
  }
  let response = { error: false, status: db.status };
  if (db.status == "processed") {
    response.result = db.result;
  }
  return response;
});

module.exports = router;
