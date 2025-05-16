"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/file");
const fs = require("fs");
const path = require("path");

// Create the express app
const app = express();

// Multer
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Routes and middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
const db = require("./models");
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// Routes
app.use("/api", apiRoutes);
app.use("/auth", authRoutes);
app.use("/file", fileRoutes);

// Error handlers
app.use(function fourOhFourHandler(req, res) {
  res.json({ error: true, code: 404, message: "page not found" });
  res.status(404).send();
});
app.use(function fiveHundredHandler(err, req, res, next) {
  console.error(err);
  res.json({ error: true, code: 500, message: "internal server error" });
  res.status(500).send();
});

// Start server
app.listen(process.env.PORT, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log(`Started at http://localhost:${process.env.PORT}`);
});
