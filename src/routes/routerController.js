const express = require("express");
const router = express.Router();
const loginRouter = require("./loginRouter");
const registerRouter = require("./registerRouter");



router.use("/register", registerRouter);

router.use("/login", loginRouter);

module.exports = router;
