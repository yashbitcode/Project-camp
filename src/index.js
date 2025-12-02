require("dotenv").config();
const app = require("./app.js");
const connectDB = require("./db/index");

const port = process.env.PORT ?? 8000;

connectDB()
    .then(() => {
        app.listen(port, () => console.log("Server running on PORT: " + port));
    })
    .catch(() => {
        console.error("CONNECTION ERROR");
        process.exit(1);
    });
