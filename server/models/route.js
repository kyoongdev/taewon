
module.exports = (sequelize, DataTypes) => {

  const CleanRoutes = sequelize.define(DEFINED.tableNames.tbl_route, {
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
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: false
    },
    start_point: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    end_point: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    home_point: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    area: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    path_point: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    }
  });
  CleanRoutes.associate = function (models) {
    CleanRoutes.belongsTo(models.tbl_group, { as: DEFINED.tbAlias.Group, foreignKey: 'gid', targetKey: 'id'});
    CleanRoutes.hasMany(models.tbl_route_detail, { as: DEFINED.tbAlias.RouteDetail, foreignKey: 'rid', sourceKey: 'id'});
	};
  
  return CleanRoutes;
}