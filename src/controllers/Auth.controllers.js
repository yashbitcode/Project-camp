const User = require("../models/user.models");
const { asyncHandler } = require("../utils/async-handler");
const ApiResponse = require("../utils/api-response");
const ApiError = require("../utils/api-error");
const { sendEmail, emailVerificationMailContent } = require("../utils/mail");
const crypto = require("node:crypto");

const generateTokens = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        return {
            accessToken,
            refreshToken
        };
    } catch {
        throw new ApiError(500, "Something went wrong while token generation");
    }
};

const register = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    const haveUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (haveUser)
        throw new ApiError(
            409,
            "User already exist with this username or email"
        );

    const user = new User({
        email,
        username,
        password,
        isEmailVerified: false
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        await user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    console.log(unHashedToken);

    const savedUser = await user.save();

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailContent: emailVerificationMailContent(
            user?.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    res.status(201).json(
        new ApiResponse(
            201,
            { user: savedUser },
            "User created and verification email sent successfully!"
        )
    );
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, "User doesn't exist with this email");

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials");

    const { accessToken, refreshToken } = await generateTokens(user);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user, accessToken, refreshToken },
                "User logged in successfully!"
            )
        );
});

const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    await User.findByIdAndUpdate(
        userId,
        {
            refreshToken: ""
        },
        {
            returnDocument: "after"
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "User logout successfully!"));
});

const getCurrentUser = asyncHandler((req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully!"));
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken)
        throw new ApiError(400, "Verification token required");

    const hash = crypto
        .createHmac("sha256", process.env.VERIFICATION_TOKEN_SECRET)
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOneAndUpdate(
        {
            emailVerificationToken: hash,
            emailVerificationExpiry: {
                $gte: Date.now()
            }
        },
        {
            emailVerificationToken: "",
            emailVerificationExpiry: null,
            isEmailVerfied: true
        },
        {
            new: true
        }
    );

    if (!user) throw new ApiError(400, "Verification token invalid");

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Email verified successfully!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.headers("refreshToken") || req.body.refreshToken;
    if (!refreshToken) throw new ApiError(400, "Refresh token is required");

    let decoded;

    try {
        decoded = await jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch {
        throw new ApiError(400, "Invalid refresh token");
    }

    const user = await User.finyById(decoded._id);

    if (!user || (user.refreshToken && user.refreshToken !== refreshToken))
        throw new ApiError(400, "Invalid refresh token");

    if (!user.refreshToken) throw new Error("Refresh token expired");

    const { accessToken, refreshToken: newRefreshToken } =
        await generateTokens(user);

    await user.save();
    
    const options = {
        httpOnly: true,
        secure: true
    };

    return res 
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed"));
});

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    verifyEmail,
    refreshAccessToken
};
