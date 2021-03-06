const express = require("express");
const router = express.Router();
const loginController = require("../controller/loginController")


router.use((req, res, next) => {
next()
});


router.post("/", loginController.loginResult);

router.post("/getUserNonce", loginController.loginGetNonce);

router.post("/getUserRole", loginController.loginGetRole);


module.exports = router