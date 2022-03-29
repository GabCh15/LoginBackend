const express = require("express");
const app = express();
const routerController = require("./routes/routerController");
const cors = require("cors");

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
  })
);

app.use("/", routerController);

app.listen(3001);
