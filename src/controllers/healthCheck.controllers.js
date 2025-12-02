const ApiError = require("../utils/api-error");
const ApiResponse = require("../utils/api-response");
const { asyncHandler } = require("../utils/async-handler");

const healthCheck = asyncHandler((req, res) => {
    res.status(200).json(
        new ApiResponse(200, {
            message: "Server is running"
        })
    );
});

module.exports = {
    healthCheck
};
