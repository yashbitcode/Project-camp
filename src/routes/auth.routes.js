const { Router } = require("express");
const { register, login } = require("../controllers/Auth.controllers");
const { userRegisterValidator, userLoginValidator } = require("../validators");
const validate = require("../middlewares/validator.middleware");
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, register);
router.route("/login").post(userLoginValidator(), validate, login);

module.exports = router;