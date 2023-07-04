
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(DEFINED.tableNames.tbl_user, {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    userid: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      allowNull: false
    },
    pwd: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      references: {
        model: DEFINED.tableNames.tbl_user_role,
        key: 'id'
      }
    },
    state: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_login: {
      type: DataTypes.DATE,
      get: function() {
        return moment(this.getDataValue('last_login')).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    last_logout: {
      type: DataTypes.DATE,
      get: function() {
        return moment(this.getDataValue('last_logout')).format('YYYY-MM-DD HH:mm:ss')
      }
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

  Users.associate = function(models) {
    Users.belongsTo(models.tbl_user_role, { as: DEFINED.tbAlias.UserRole, foreignKey: 'role', targetKey: 'id'});
    Users.hasMany(models.tbl_user_group, { as: DEFINED.tbAlias.UserGroup, foreignKey: 'uid', sourceKey: 'id'});
    Users.hasMany(models.tbl_user_token, { as: DEFINED.tbAlias.UserToken, foreignKey: 'uid', sourceKey: 'id'});
  };

  return Users;
}
