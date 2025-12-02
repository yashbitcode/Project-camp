require("dotenv").config()

const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB conn. estab");
    } catch (error) {
        console.error("MongoDB conn. error: " + error);
        process.exit(1);
    }
}

module.exports = connectDB;