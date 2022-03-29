const express = require("express");
const router = express.Router()
const controller = require("../controller/index")

router.use((req, res, next) => {
  next();
});


router.post("/", controller.registerController.registerResult);

module.exports = router;
