const User = require("../models/user.models");
const ApiError = require("../utils/api-error");
const { asyncHandler } = require("../utils/async-handler")
const jwt = require("jsonwebtoken");

const authenticateToken = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken || req.headers["Authorization"]?.replace("Bearer ", "");

    if(!accessToken) throw new ApiError(400, "Access token required");

    let decoded;
    
    try {
        decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); 
    } catch {
        throw new ApiError("Invalid/expired token");
    }

    const user = await User.findById(decoded._id).select("-password -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry -refreshToken");

    if(!user) throw new ApiError(400, "User not authenticated");

    req.user = user;
    next();
});

module.exports = {
    authenticateToken
};