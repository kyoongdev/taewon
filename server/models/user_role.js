
module.exports = (sequelize, DataTypes) => {

  const UserRole = sequelize.define(DEFINED.tableNames.tbl_user_role, {
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
  });
  UserRole.associate = function (models) {
    //Next
    UserRole.hasMany(models.tbl_user, {as: DEFINED.tbAlias.User, foreignKey: 'role', sourceKey: 'id'});
	};
  
  return UserRole;
}