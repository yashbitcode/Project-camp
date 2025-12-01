const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "UPDATE", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.get("/", (req, res) => res.send("all good"));

module.exports = app;
