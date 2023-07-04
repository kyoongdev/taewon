
module.exports = (sequelize, DataTypes) => {

  const VPosition = sequelize.define(DEFINED.tableNames.tbl_position, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    event_date: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    vid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },    
    lng: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false
    },
    lat: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false
    },
    battery: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    water: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    speed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    garbage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    clean_completion: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    clean_remain_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    state: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    system_mode: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    error: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  });
  
  VPosition.associate = function (models) {
    VPosition.hasMany(models.tbl_vehicle, {as: DEFINED.tbAlias.Vehicle, foreignKey: 'id', sourceKey: 'vid'});
	};
  
  return VPosition;
}