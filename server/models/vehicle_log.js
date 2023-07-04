
module.exports = (sequelize, DataTypes) => {

  const VehicleLog = sequelize.define(DEFINED.tableNames.tbl_vehicle_log, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    log_date: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    log_code: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    vid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    rid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    vstate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    speed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    latitude: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    longitude: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    water: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    garbage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    battery: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
  });
  
  VehicleLog.associate = function (models) {
    VehicleLog.hasMany(models.tbl_vehicle, {as: DEFINED.tbAlias.Vehicle, foreignKey: 'id', sourceKey: 'vid'});
    VehicleLog.hasMany(models.tbl_route, {as: DEFINED.tbAlias.CleanRoute, foreignKey: 'id', sourceKey: 'rid'});
	};
  
  return VehicleLog;
}