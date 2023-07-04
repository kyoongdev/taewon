const db = {};
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require("../config/appconfig");
const dbconfig = config.db;
const basename = path.basename(__filename);
const sequelize = new Sequelize(dbconfig);
// check the databse connection
// sequelize
// .authenticate()
// .then(() => console.log('Connection has been established successfully.'))
// .catch(err => console.error('Unable to connect to the database:', err));

/**
 * Load all models
 * from models directories
 */

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
