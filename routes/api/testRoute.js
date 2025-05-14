const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let db = await req.db
      .db("db_name")
      .collection("collection_name")
      .findOne({});
    res.json({ status: "on", database: "working" });
  } catch (err) {
    res.json({ status: "off", database: "not working" });
  }
});

module.exports = router;
