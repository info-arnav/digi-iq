const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  let db = await req.db.db("db_name").collection("collection_name").findOne({});
  res.json({ status: "on", database: "working" });
});

module.exports = router;
