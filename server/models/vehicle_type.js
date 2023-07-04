
module.exports = (sequelize, DataTypes) => {

  const VehicleType = sequelize.define(DEFINED.tableNames.tbl_vehicle_type, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      allowNull: false
    },
    desc: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      allowNull: false
    }
  });
  VehicleType.associate = function (models) {
    VehicleType.hasMany(models.tbl_vehicle, {as: DEFINED.tbAlias.Vehicle, foreignKey: 'type', sourceKey: 'id'});
	};
  
  return VehicleType;
}