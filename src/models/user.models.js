const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const UserSchema = new Schema({
    avatar: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: "https://placehold.co/200",
            localPath: ""
        }
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        lowercase: true,
        trim: true,
        unique: [true, "Username should be unique"],
        index: true,
        min: [5, "Minimum length should be 5"],
        max: [10, "Maximum length can be 10"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        unique: [true, "Email should be unique"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    isEmailVerfied: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    refreshToken: String
});

UserSchema.pre("save", async function() {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);    
});

UserSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = async function() {
    const token = jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });

    return token;
};

UserSchema.methods.generateRefreshToken = async function() {
    const token = jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });

    return token;
};

UserSchema.methods.generateTemporaryToken = async function() {
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
        .createHmac("sha256", process.env.VERIFICATION_TOKEN_SECRET)
        .update(unHashedToken)
        .digest("hex");
    const tokenExpiry = Date.now() + (20 * 60 * 1000);

    return {
        unHashedToken,
        hashedToken,
        tokenExpiry
    };
};

const User = new model("User", UserSchema);
module.exports = User;
