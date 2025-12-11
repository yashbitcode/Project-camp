const { Router } = require("express");
const { userRegisterValidator, userLoginValidator } = require("../validators");
const validate = require("../middlewares/validator.middleware");
const { register, login, logout, getCurrentUser, verifyEmail } = require("../controllers/auth.controllers");
const { authenticateToken } = require("../middlewares/auth.middleware");
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, register);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/logout").post(authenticateToken, logout);
router.route("/current-user").get(authenticateToken, getCurrentUser);
router.route("/verify-email/:verificationToken").post(verifyEmail);

module.exports = router;