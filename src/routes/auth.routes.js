const { Router } = require("express");
const { userRegisterValidator, userLoginValidator } = require("../validators");
const validate = require("../middlewares/validator.middleware");
const { register, login, logout } = require("../controllers/auth.controllers");
const { authenticateToken } = require("../middlewares/auth.middleware");
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, register);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/logout").post(authenticateToken, logout);

module.exports = router;