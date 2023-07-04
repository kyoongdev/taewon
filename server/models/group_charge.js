
module.exports = (sequelize, DataTypes) => {

  const GroupChargeStations = sequelize.define(DEFINED.tableNames.tbl_group_charge_station, {
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
    name: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(200),
      defaultValue: '',
      allowNull: false
    },
    location: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
  });
  GroupChargeStations.associate = function (models) {
    GroupChargeStations.belongsTo(models.tbl_group, { as: DEFINED.tbAlias.Group, foreignKey: 'gid', targetKey: 'id'});
    GroupChargeStations.hasMany(models.tbl_route_detail, { as: DEFINED.tbAlias.RouteDetail, foreignKey: 'charge_id', sourceKey: 'id'});
	};
  
  return GroupChargeStations;
}