const express = require("express");
const router = express.Router();

const createTask = require("./createTask");

router.use("/create-task", createTask);

module.exports = router;
