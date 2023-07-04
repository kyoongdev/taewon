
module.exports = (sequelize, DataTypes) => {
  const Groups = sequelize.define(DEFINED.tableNames.tbl_group, {
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
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: false
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
    },
  });
  
  Groups.associate = function (models) {
    Groups.hasMany(models.tbl_group_garage, { as: DEFINED.tbAlias.Garage, foreignKey: 'gid', sourceKey: 'id'});
    Groups.hasMany(models.tbl_group_charge_station, { as: DEFINED.tbAlias.ChargeStation, foreignKey: 'gid', sourceKey: 'id'});
    Groups.hasMany(models.tbl_user_group, { as: DEFINED.tbAlias.UserGroup, foreignKey: 'gid', sourceKey: 'id'});
    Groups.hasMany(models.tbl_vehicle_group, { as: DEFINED.tbAlias.VehicleGroup, foreignKey: 'gid', sourceKey: 'id'});
    Groups.hasMany(models.tbl_route, { as: DEFINED.tbAlias.CleanRoute, foreignKey: 'gid', sourceKey: 'id'});
	};

	return Groups;
}
