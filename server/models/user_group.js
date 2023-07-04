
module.exports = (sequelize, DataTypes) => {

  const UserGroups = sequelize.define(DEFINED.tableNames.tbl_user_group, {
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
    uid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      references: {
        model: DEFINED.tableNames.tbl_user,
        key: 'id'
      }
    },
  });
  UserGroups.associate = function (models) {
    UserGroups.belongsTo(models.tbl_user, { as: DEFINED.tbAlias.User, foreignKey: 'uid', targetKey: 'id'});
    UserGroups.belongsTo(models.tbl_group, { as: DEFINED.tbAlias.Group, foreignKey: 'gid', targetKey: 'id'});
	};
  
  return UserGroups;
}