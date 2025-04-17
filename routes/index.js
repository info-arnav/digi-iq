const express = require("express");
const router = express.Router();

const testRoute = require("./testRoute");
const imageReq = require("./imageReq");
const videoReq = require("./videoReq");
const lipSyncReq = require("./lipSyncReq");
const checkStatus = require("./checkStatus");

router.use("/test", testRoute);
router.use("/image-req", imageReq);
router.use("/lip-sync-req", lipSyncReq);
router.use("/video-req", videoReq);
router.use("/check-status", checkStatus);

module.exports = router;
