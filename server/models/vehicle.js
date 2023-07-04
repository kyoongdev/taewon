
module.exports = (sequelize, DataTypes) => {

  const Vehicles = sequelize.define(DEFINED.tableNames.tbl_vehicle, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    vcode: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_vehicle_type,
        key: 'id'
      }
    },
    model: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      allowNull: false
    },
    myear: {
      type: DataTypes.STRING(10),
      defaultValue: '',
      allowNull: false
    },
    state: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false,
    },
    speed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    water: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    garbage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    battery: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    camera_stream:{
      type: DataTypes.STRING(200),
      defaultValue: '',
      allowNull: false
    },
    clean_route_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
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
    reg_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get: function() {
        return moment(this.getDataValue('reg_date')).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    update_date: {
      type: DataTypes.DATE,
      get: function() {
        return moment(this.getDataValue('update_date')).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  });
  Vehicles.associate = function (models) {
    Vehicles.belongsTo(models.tbl_vehicle_type, { as: DEFINED.tbAlias.VehicleType, foreignKey: 'type', targetKey: 'id'});
    Vehicles.hasMany(models.tbl_vehicle_group, { as: DEFINED.tbAlias.VehicleGroup, foreignKey: 'vid', sourceKey: 'id'});
    Vehicles.hasMany(models.tbl_vehicle_fod, { as: DEFINED.tbAlias.VehicleFod, foreignKey: 'vid', sourceKey: 'id'});
	};
  
  return Vehicles;
}