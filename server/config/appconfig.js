const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// config.js
module.exports = {
  app: {
    public_ip: process.env.DEV_APP_HOST_PUBLIC_IP || "localhost",
    host: process.env.DEV_APP_HOST || "localhost",
    port: process.env.DEV_APP_PORT || 8000,
    env: process.env.NODE_ENV || "development",
    socketkey: process.env.SOCKET_KEY || "VCLEAN",
    events: process.env.WS_EVENTS || "comm:subchannel:events",
    commands: process.env.WS_COMMANDS || "comm:subchannel:commands",
  },
  db: {
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || "vclean",
    password: process.env.DB_PASS || "rootuser",
    username: process.env.DB_USER || "root",
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    pool: {
      max: parseInt(process.env.POOL_MAX, 10) || 5,
      min: parseInt(process.env.POOL_MIN, 10) || 1,
      acquire: parseInt(process.env.POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.POOL_IDLE, 10) || 10000,
    },
    define: {
      timestamps: false,
      freezeTableName: true,
      underscored: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      logging: false,
    },
  },
  auth: {
    jwt_secret: process.env.JWT_SECRET || "MY_SECRET",
    jwt_expiresin: process.env.JWT_EXPIRES_IN || "1d", // 1 day
    saltRounds: process.env.SALT_ROUND || 10,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || "ServerSecretKey",
    refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || "2d", // 2 days
  },
  mail: {
    host: process.env.MAIL_SERVER_HOST || "mail.skyautonet.com",
    port: process.env.MAIL_SERVER_PORT || "25",
    user: process.env.MAIL_SYSTEM_USR || "x@skyautonet.com",
    pwd: process.env.MAIL_SYSTEM_PWD || "x",
  },
};
