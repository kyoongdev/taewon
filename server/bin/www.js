/**
 * Module dependencies.
 */
const config = require("../config/appconfig");
const http = require("http");
const app = require("../server/index");
const Logger = require("../utils/logger");
const logger = new Logger();
const models = require("../models");
/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.app.port);
app.set("port", port);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.log(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.log(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;

  logger.log(`the server started listining on port ${bind}`, "info");
}

app.io.attach(server);

/**
 * Listen on provided port, on all network interfaces.
 */
(async () => {
  await models.sequelize.sync();
  await models.sequelize.init();
  server.listen(port);
  server.on("error", onError);
  server.on("listening", onListening);
})();

global.app = app;
