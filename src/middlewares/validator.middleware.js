const { validationResult } = require("express-validator");
const ApiError = require("../utils/api-error");

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) return next();
    const formattedErrors = [];

    errors
        .array()
        .forEach((el) =>
            formattedErrors.push({ [el.path]: el.msg })
        );

    throw new ApiError(422, "Data validation failed", formattedErrors);
};

module.exports = validate;
