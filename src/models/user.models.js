const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

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

UserSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);    
    next();
});

UserSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = new model("User", UserSchema);
module.exports = User;
