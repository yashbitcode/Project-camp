const express = require("express");
const cors = require("cors");
const healthCheckRouter = require("./routes/healthCheck.routes");
const AuthRouter = require("./routes/auth.routes");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "UPDATE", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", AuthRouter);

module.exports = app;
