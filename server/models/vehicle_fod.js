
module.exports = (sequelize, DataTypes) => {
  const VehicleFod = sequelize.define(DEFINED.tableNames.tbl_vehicle_fod, {
    vid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_vehicle,
        key: 'id'
      }
    },
    rid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_route,
        key: 'id'
      }
    },
    lat: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false,
    },
    lon: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    video: {
      type: DataTypes.STRING(250),
      defaultValue: '',
      allowNull: false
    },
    create_dt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get: function() {
        return moment(this.getDataValue('create_dt')).format('YYYY-MM-DD HH:mm:ss')
      }
    },
  });
  
  VehicleFod.associate = function (models) {
    VehicleFod.belongsTo(models.tbl_vehicle, { as: DEFINED.tbAlias.Vehicle, foreignKey: 'vid', targetKey: 'id'});
    VehicleFod.belongsTo(models.tbl_route, { as: DEFINED.tbAlias.CleanRoute, foreignKey: 'rid', targetKey: 'id'});
	};
  
  return VehicleFod;
}