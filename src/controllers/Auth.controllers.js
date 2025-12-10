const User = require("../models/user.models");
const { asyncHandler } = require("../utils/async-handler");
const ApiResponse = require("../utils/api-response");
const ApiError = require("../utils/api-error");
const { sendEmail, emailVerificationMailContent } = require("../utils/mail");

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

module.exports = {
    register,
    login,
    logout
};
