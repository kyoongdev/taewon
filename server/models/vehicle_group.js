
module.exports = (sequelize, DataTypes) => {

  const VehicleGroups = sequelize.define(DEFINED.tableNames.tbl_vehicle_group, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    gid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_group,
        key: 'id'
      }
    },
    vid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_vehicle,
        key: 'id'
      }
    },
  });
  VehicleGroups.associate = function (models) {
    VehicleGroups.belongsTo(models.tbl_vehicle, { as: DEFINED.tbAlias.Vehicle, foreignKey: 'vid', targetKey: 'id'});
    VehicleGroups.belongsTo(models.tbl_group, { as: DEFINED.tbAlias.Group, foreignKey: 'gid', targetKey: 'id'});
	};
  
  return VehicleGroups;
}