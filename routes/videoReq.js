const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let db = await req.db
      .db("digiIQ")
      .collection("requests")
      .insetOne({
        status: "qued",
        createdAt: new Date(),
        user_data: JSON.parse(req.body),
        req_type: "video",
      });
    res.json({
      message: "video request added to que",
      error: false,
      task_id: JSON.stringify(db.insertedId),
    });
  } catch (err) {
    res.json({ message: err, error: true });
  }
});

module.exports = router;
