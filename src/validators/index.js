const { body } = require("express-validator");

const userRegisterValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .notEmpty()
            .withMessage("Username is required")
            .isLength({min: 5})
            .withMessage("Username should be 5 characters long")
            .isLength({max: 10})
            .withMessage("Username can be 10 characters long"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isStrongPassword()
            .withMessage("Password should be strong")
    ];
};

const userLoginValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isStrongPassword()
            .withMessage("Password should be strong")
    ];
};

module.exports = {
    userRegisterValidator,
    userLoginValidator
};