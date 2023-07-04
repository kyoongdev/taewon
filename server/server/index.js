const uuid = require("uuid");
const bodyParser = require("body-parser");
const varGlobal = require("../config/global");
const config = require("../config/appconfig");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const Logger = require("../utils/logger");
const swagger = require("../utils/swagger");

const app = express();
const logger = new Logger();

const io = require("../utils/socketio");
app.io = io;

global.DEFINED = varGlobal;

app.set("config", config);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(require("method-override")());
app.use(compression());
/*
 * terminate server process
 */
process.on("SIGINT", () => {
  logger.log("stopping the server", "info");
  process.exit();
});

/*
 * load database models
 */
app.set("db", require("../models/index.js"));

/*
 * Swagger API document
 * http://localhost:8000/api/docs
 */
app.use("/api/docs", swagger.router);

/*
 * set access-control-allow-origin
 */
app.use(cors());
// const corsOptions = {
//   origin: [
// 		"http://0.0.0.0:8000",
//     "http://localhost:8000",
//   ]
// };
// app.use(cors(corsOptions));

/*
 * Store log client request
 */
app.use((req, res, next) => {
  req.identifier = uuid.v4();
  // const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
  const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers["user-agent"]}`;
  logger.log(logString, "info");
  next();
});

/*
 * Set all router urls
 */
app.use(require("../router"));

/*
 * Store log client response
 */
app.use((req, res, next) => {
  logger.log(
    "the url you are trying to reach is not hosted on our server",
    "error"
  );
  const err = new Error("Not Found");
  err.status = 404;
  res.status(err.status).json({
    type: "error",
    message: "the url you are trying to reach is not hosted on our server",
  });
  next(err);
});

module.exports = app;
