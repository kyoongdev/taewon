
module.exports = (sequelize, DataTypes) => {

  const CleanRouteDetails = sequelize.define(DEFINED.tableNames.tbl_route_detail, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
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
    vid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_vehicle,
        key: 'id'
      }
    },
    charge_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_group_charge_station,
        key: 'id'
      }
    },
    garage_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_group_garage,
        key: 'id'
      }
    },
    clean_start_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    clean_end_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    estimated_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  });
  CleanRouteDetails.associate = function (models) {
    CleanRouteDetails.belongsTo(models.tbl_route, { as: DEFINED.tbAlias.CleanRoute, foreignKey: 'rid', targetKey: 'id'});
    CleanRouteDetails.belongsTo(models.tbl_vehicle, { as: DEFINED.tbAlias.Vehicle, foreignKey: 'vid', targetKey: 'id'});
    CleanRouteDetails.belongsTo(models.tbl_group_garage, { as: DEFINED.tbAlias.Garage, foreignKey: 'garage_id', targetKey: 'id'})
    CleanRouteDetails.belongsTo(models.tbl_group_charge_station,  { as: DEFINED.tbAlias.ChargeStation, foreignKey: 'charge_id', targetKey: 'id'})
	};
  
  return CleanRouteDetails;
}